from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('emissions.urls')),  # Include the URLs from the emissions app
]
