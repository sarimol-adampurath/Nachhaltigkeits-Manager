#!/usr/bin/env sh
set -e

cd /app/backend
python manage.py migrate --noinput
python manage.py seed_emission_factors
python manage.py collectstatic --noinput

exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 2 --timeout 120
