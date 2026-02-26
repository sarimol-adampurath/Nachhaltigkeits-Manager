from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmissionFactorViewSet, ActivityLogViewSet

# This router only handles routes for THIS app
router = DefaultRouter()
router.register(r'factors', EmissionFactorViewSet, basename='factors')
router.register(r'logs', ActivityLogViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
]