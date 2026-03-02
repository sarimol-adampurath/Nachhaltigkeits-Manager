from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.
class EmissionFactor(models.Model):
    """
    Katalog der Emissionsfaktoren (The "Carbon Library").
    Stores the CO2-equivalent value for different types of energy or activities.
    Example: 1 kWh of Electricity = 0.328 kg CO2.
    """
    category = models.CharField(max_length=100, unique=True)
    unit = models.CharField(max_length=20)
    factor = models.DecimalField(max_digits=10, decimal_places=5)

    def __str__(self):
        return f"{self.category} ({self.unit})" 

class ActivityLog(models.Model):
    """
    Verbrauchsprotokoll (The "Activity Journal").
    Records a specific business activity on a certain date. 
    It links to an EmissionFactor to calculate the total environmental impact.
    """
    date = models.DateField()
    category = models.ForeignKey(EmissionFactor, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    note = models.CharField(max_length=500, blank=True, null=True)

    #Store the calculation in the DB to avoid recalculating on every read. This is a denormalization for performance.
    co2_total = models.DecimalField(max_digits=20, decimal_places=5, editable=False, default=0)

    def save(self, *args, **kwargs):
        # Calculate before saving to the database
        self.co2_total = self.quantity * self.category.factor
        super().save(*args, **kwargs)

    