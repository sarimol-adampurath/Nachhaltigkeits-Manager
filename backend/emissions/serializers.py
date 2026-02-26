from rest_framework import serializers
from .models import EmissionFactor, ActivityLog

class EmissionFactorSerializer(serializers.ModelSerializer):
    """
    Provides the available carbon factors. 
    Read-only for most users to ensure data integrity.
    """
    class Meta:
        model = EmissionFactor
        fields = ['id', 'category', 'unit', 'factor']

class ActivityLogSerializer(serializers.ModelSerializer):
    """
    The main data bridge for consumption entries.
    Includes calculated fields and human-readable labels.
    """
    # 'source' allows us to grab the name of the category instead of the ID
    category_name = serializers.CharField(source='category.category', read_only=True)
    co2_total = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'date', 'category', 'category_name', 'quantity', 'co2_total', 'note']

    def validate_quantity(self, value):
        """
        Business Logic Validation: 
        Ensure no one tries to enter a zero or negative consumption.
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive number.")
        return value