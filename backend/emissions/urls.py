from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmissionFactorViewSet, ActivityLogViewSet, register_user, user_profile

# This router only handles routes for THIS app
router = DefaultRouter()
router.register(r'factors', EmissionFactorViewSet, basename='factors')
router.register(r'logs', ActivityLogViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('profile/', user_profile, name='profile'),
]