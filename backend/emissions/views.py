from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import EmissionFactor, ActivityLog
from .serializers import (
    EmissionFactorSerializer,
    ActivityLogSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user account.
    Endpoint: POST /api/register/
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'User registered successfully. You can now log in.'},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    user = User.objects.filter(email=email).first()

    response_data = {'message': 'If that email exists, a password reset link has been generated.'}

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"
        if settings.DEBUG:
            response_data['reset_link'] = reset_link

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uid = serializer.validated_data['uid']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    current_password = serializer.validated_data['current_password']
    new_password = serializer.validated_data['new_password']

    user = request.user
    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get or update the currently authenticated user's profile.
    Endpoint: GET/PUT/PATCH /api/profile/
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    partial = request.method == 'PATCH'
    serializer = UserProfileSerializer(request.user, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmissionFactorViewSet(viewsets.ModelViewSet):
    """
    Global emission factors - shared by all users.
    Read-only for regular users, editable by admin.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    """
    Activity logs - each user only sees and edits their own logs.
    Can be filtered by date range using query parameters:
    - start_date: filter logs from this date onwards (YYYY-MM-DD)
    - end_date: filter logs up to this date (YYYY-MM-DD)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        """Filter activity logs to only show the current user's logs, with optional date filtering"""
        queryset = ActivityLog.objects.filter(user=self.request.user).select_related('category')
        
        # Get date range parameters from query string
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        # Apply date filters if provided
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        """Automatically set the user when creating a new log"""
        serializer.save(user=self.request.user)

