from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ActivityLog, EmissionFactor


class EmissionsApiTests(APITestCase):
    def setUp(self):
        self.password = "SecurePass123!"
        self.user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password=self.password,
        )
        self.other_user = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="OtherPass123!",
        )

        self.electricity = EmissionFactor.objects.create(
            category="Electricity",
            unit="kWh",
            factor=Decimal("0.32800"),
        )
        self.gas = EmissionFactor.objects.create(
            category="Natural Gas",
            unit="m3",
            factor=Decimal("2.02000"),
        )

        self.log_today = ActivityLog.objects.create(
            user=self.user,
            date=date.today(),
            category=self.electricity,
            quantity=Decimal("100.00"),
            note="Office usage",
        )
        self.log_old = ActivityLog.objects.create(
            user=self.user,
            date=date.today() - timedelta(days=40),
            category=self.gas,
            quantity=Decimal("10.00"),
            note="Heating",
        )
        ActivityLog.objects.create(
            user=self.other_user,
            date=date.today(),
            category=self.electricity,
            quantity=Decimal("200.00"),
            note="Other user data",
        )

    def authenticate(self):
        token_url = reverse("token_obtain_pair")
        response = self.client.post(
            token_url,
            {"username": self.user.username, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_register_user_success(self):
        url = reverse("register")
        payload = {
            "username": "charlie",
            "email": "charlie@example.com",
            "password": "StrongPass456!",
            "password_confirm": "StrongPass456!",
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="charlie").exists())

    def test_register_user_password_mismatch(self):
        url = reverse("register")
        payload = {
            "username": "dana",
            "email": "dana@example.com",
            "password": "StrongPass456!",
            "password_confirm": "Mismatch456!",
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_logs_list_returns_only_authenticated_user_logs(self):
        self.authenticate()

        url = reverse("logs-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        returned_ids = {item["id"] for item in response.data}
        self.assertIn(self.log_today.id, returned_ids)
        self.assertIn(self.log_old.id, returned_ids)

    def test_logs_filter_by_date_range(self):
        self.authenticate()

        start_date = (date.today() - timedelta(days=7)).isoformat()
        url = reverse("logs-list")
        response = self.client.get(url, {"start_date": start_date})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.log_today.id)

    def test_export_csv_requires_authentication(self):
        url = reverse("export-csv")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_export_csv_returns_csv_with_expected_content(self):
        self.authenticate()

        url = reverse("export-csv")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn('attachment; filename="emissions_report_', response["Content-Disposition"])

        body = response.content.decode("utf-8")
        self.assertIn("Date,Category,Quantity,Unit,CO2 (kg),Note", body)
        self.assertIn("Electricity", body)
        self.assertIn("Natural Gas", body)
        self.assertIn("TOTAL CO2 (kg):", body)
        self.assertNotIn("Other user data", body)

    def test_export_pdf_returns_pdf_file(self):
        self.authenticate()

        url = reverse("export-pdf")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn('attachment; filename="emissions_report_', response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_export_pdf_honors_date_filter(self):
        self.authenticate()

        start_date = (date.today() - timedelta(days=7)).isoformat()
        url = reverse("export-pdf")
        response = self.client.get(url, {"start_date": start_date})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_profile_get_requires_authentication(self):
        url = reverse("profile")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_get_returns_user_data(self):
        self.authenticate()

        url = reverse("profile")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "alice")
        self.assertEqual(response.data["email"], "alice@example.com")
        self.assertIn("first_name", response.data)
        self.assertIn("last_name", response.data)

    def test_profile_update_email(self):
        self.authenticate()

        url = reverse("profile")
        payload = {"email": "alice.new@example.com"}
        response = self.client.patch(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "alice.new@example.com")
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "alice.new@example.com")

    def test_profile_cannot_change_username(self):
        self.authenticate()

        url = reverse("profile")
        payload = {"username": "alice_modified"}
        response = self.client.patch(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "alice")  # Should remain unchanged

    def test_change_password_requires_authentication(self):
        url = reverse("change-password")
        payload = {
            "current_password": "SecurePass123!",
            "new_password": "NewSecurePass456!",
            "new_password_confirm": "NewSecurePass456!",
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_success(self):
        self.authenticate()

        url = reverse("change-password")
        payload = {
            "current_password": self.password,
            "new_password": "NewSecurePass456!",
            "new_password_confirm": "NewSecurePass456!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        
        # Verify password was actually changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecurePass456!"))

    def test_change_password_wrong_current_password(self):
        self.authenticate()

        url = reverse("change-password")
        payload = {
            "current_password": "WrongPassword123!",
            "new_password": "NewSecurePass456!",
            "new_password_confirm": "NewSecurePass456!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_change_password_mismatch_new_passwords(self):
        self.authenticate()

        url = reverse("change-password")
        payload = {
            "current_password": self.password,
            "new_password": "NewSecurePass456!",
            "new_password_confirm": "DifferentPassword789!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_forgot_password_returns_success_for_existing_email(self):
        url = reverse("forgot-password")
        payload = {"email": "alice@example.com"}

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        # In DEBUG mode, reset_link may be present (optional check)
        # Just verify the endpoint works correctly

    def test_forgot_password_returns_success_for_non_existing_email(self):
        url = reverse("forgot-password")
        payload = {"email": "nonexistent@example.com"}

        response = self.client.post(url, payload, format="json")

        # Should return same response for security reasons
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_reset_password_with_valid_token(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        # Generate valid token
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        url = reverse("reset-password")
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "ResetPassword123!",
            "new_password_confirm": "ResetPassword123!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ResetPassword123!"))

    def test_reset_password_with_invalid_token(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        url = reverse("reset-password")
        payload = {
            "uid": uid,
            "token": "invalid-token",
            "new_password": "ResetPassword123!",
            "new_password_confirm": "ResetPassword123!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_reset_password_mismatch_new_passwords(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        url = reverse("reset-password")
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "ResetPassword123!",
            "new_password_confirm": "DifferentPassword456!",
        }
        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)
