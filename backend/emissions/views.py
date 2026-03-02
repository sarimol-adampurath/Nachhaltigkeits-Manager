from rest_framework import viewsets
from .models import EmissionFactor, ActivityLog
from .serializers import EmissionFactorSerializer, ActivityLogSerializer


class EmissionFactorViewSet(viewsets.ModelViewSet):
    """Handles GET, POST, PUT, DELETE for factors."""

    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer

class ActivityLogViewSet(viewsets.ModelViewSet):
    """Handles GET, POST, PUT, DELETE for activity logs."""
    queryset = ActivityLog.objects.all().select_related('category')
    serializer_class = ActivityLogSerializer
