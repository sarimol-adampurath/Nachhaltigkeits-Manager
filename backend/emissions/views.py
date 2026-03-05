from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import EmissionFactor, ActivityLog
from .serializers import EmissionFactorSerializer, ActivityLogSerializer, UserRegistrationSerializer, UserProfileSerializer


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

