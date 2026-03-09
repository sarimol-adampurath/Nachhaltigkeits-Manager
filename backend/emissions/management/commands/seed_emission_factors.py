from django.core.management.base import BaseCommand
from emissions.models import EmissionFactor


class Command(BaseCommand):
    help = 'Populate EmissionFactor table with default carbon emission data'

    def handle(self, *args, **options):
        """
        Create emission factors if they don't exist.
        This ensures the app always has data for the category dropdown.
        """
        emission_factors = [
            {
                'category': 'Electricity',
                'unit': 'kWh',
                'factor': 0.328,  # kg CO2 per kWh (average grid mix)
            },
            {
                'category': 'Natural Gas',
                'unit': 'm³',
                'factor': 2.02,  # kg CO2 per cubic meter
            },
            {
                'category': 'Heating Oil',
                'unit': 'L',
                'factor': 2.68,  # kg CO2 per liter
            },
            {
                'category': 'Gasoline',
                'unit': 'L',
                'factor': 2.31,  # kg CO2 per liter
            },
            {
                'category': 'Diesel',
                'unit': 'L',
                'factor': 2.65,  # kg CO2 per liter
            },
            {
                'category': 'Public Transport (Bus)',
                'unit': 'km',
                'factor': 0.089,  # kg CO2 per km
            },
            {
                'category': 'Public Transport (Train)',
                'unit': 'km',
                'factor': 0.041,  # kg CO2 per km
            },
            {
                'category': 'Car Travel',
                'unit': 'km',
                'factor': 0.192,  # kg CO2 per km (average car)
            },
            {
                'category': 'Flight (Short-haul)',
                'unit': 'km',
                'factor': 0.255,  # kg CO2 per km
            },
            {
                'category': 'Flight (Long-haul)',
                'unit': 'km',
                'factor': 0.195,  # kg CO2 per km
            },
            {
                'category': 'Water Consumption',
                'unit': 'L',
                'factor': 0.000344,  # kg CO2 per liter
            },
            {
                'category': 'Paper',
                'unit': 'kg',
                'factor': 1.32,  # kg CO2 per kg of paper
            },
            {
                'category': 'Plastic Waste',
                'unit': 'kg',
                'factor': 6.0,  # kg CO2 per kg of plastic
            },
        ]

        created_count = 0
        existing_count = 0

        for factor_data in emission_factors:
            factor, created = EmissionFactor.objects.get_or_create(
                category=factor_data['category'],
                defaults={
                    'unit': factor_data['unit'],
                    'factor': factor_data['factor'],
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {factor.category}')
                )
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Emission factors ready: {created_count} created, {existing_count} already existed'
            )
        )
