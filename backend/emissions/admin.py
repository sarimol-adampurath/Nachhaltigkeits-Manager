from django.contrib import admin
from .models import EmissionFactor, ActivityLog

# Register your models here.
@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = ('category', 'unit', 'factor')
    search_fields = ('category',)   

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):   
    list_display = ('date', 'category', 'quantity', 'get_co2_total')
    list_filter = ('date', 'category')

    def get_co2_total(self, obj):
        return f"{obj.co2_total:.2f} kg"
    
    get_co2_total.short_description = 'Total CO2 (kg)'