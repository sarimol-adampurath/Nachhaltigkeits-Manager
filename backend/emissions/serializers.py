from rest_framework import serializers
from .models import EmissionFactor, ActivityLog
from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration during sign-up.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        """Validate that passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user


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