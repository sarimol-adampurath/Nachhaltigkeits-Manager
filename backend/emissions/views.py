from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import EmissionFactor, ActivityLog
from .serializers import EmissionFactorSerializer, ActivityLogSerializer, UserRegistrationSerializer


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
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        """Filter activity logs to only show the current user's logs"""
        return ActivityLog.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        """Automatically set the user when creating a new log"""
        serializer.save(user=self.request.user)

