from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import EmissionFactor, ActivityLog
from .serializers import (
    EmissionFactorSerializer,
    ActivityLogSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from io import BytesIO
import json


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user account.
    Endpoint: POST /api/register/
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'User registered successfully. You can now log in.'},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    user = User.objects.filter(email=email).first()

    response_data = {'message': 'If that email exists, a password reset link has been generated.'}

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"
        if settings.DEBUG:
            response_data['reset_link'] = reset_link

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uid = serializer.validated_data['uid']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    current_password = serializer.validated_data['current_password']
    new_password = serializer.validated_data['new_password']

    user = request.user
    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get or update the currently authenticated user's profile.
    Endpoint: GET/PUT/PATCH /api/profile/
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    partial = request.method == 'PATCH'
    serializer = UserProfileSerializer(request.user, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmissionFactorViewSet(viewsets.ModelViewSet):
    """
    Global emission factors - shared by all users.
    Read-only for regular users, editable by admin.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer


class ActivityLogPagination(PageNumberPagination):
    page_size = 20


class ActivityLogViewSet(viewsets.ModelViewSet):
    """
    Activity logs - each user only sees and edits their own logs.
    Can be filtered by date range using query parameters:
    - start_date: filter logs from this date onwards (YYYY-MM-DD)
    - end_date: filter logs up to this date (YYYY-MM-DD)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityLogSerializer
    pagination_class = ActivityLogPagination

    def get_queryset(self):
        """Filter activity logs to only show the current user's logs, with optional date filtering"""
        queryset = ActivityLog.objects.filter(user=self.request.user).select_related('category')

        # Get date range parameters from query string
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        # Apply date filters if provided
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset.order_by('-date')

    def perform_create(self, serializer):
        """Automatically set the user when creating a new log"""
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_csv(request):
    """
    Export user's activity logs as CSV file.
    Query parameters:
    - start_date: filter logs from this date onwards (YYYY-MM-DD)
    - end_date: filter logs up to this date (YYYY-MM-DD)
    """
    # Get user's activity logs
    queryset = ActivityLog.objects.filter(user=request.user).select_related('category')
    
    # Apply date filters if provided
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if start_date:
        queryset = queryset.filter(date__gte=start_date)
    if end_date:
        queryset = queryset.filter(date__lte=end_date)
    
    queryset = queryset.order_by('-date')
    
    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    filename = f"emissions_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    writer = csv.writer(response)
    writer.writerow(['Date', 'Category', 'Quantity', 'Unit', 'CO2 (kg)', 'Note'])
    
    total_co2 = 0
    for log in queryset:
        writer.writerow([
            log.date.strftime('%Y-%m-%d'),
            log.category.category,
            f"{log.quantity:.2f}",
            log.category.unit,
            f"{log.co2_total:.5f}",
            log.note or ''
        ])
        total_co2 += float(log.co2_total)
    
    # Add summary row
    writer.writerow([])
    writer.writerow(['TOTAL CO2 (kg):', f"{total_co2:.5f}"])
    
    return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_pdf(request):
    """
    Export user's activity logs as PDF file with summary and table.
    Query parameters:
    - start_date: filter logs from this date onwards (YYYY-MM-DD)
    - end_date: filter logs up to this date (YYYY-MM-DD)
    """
    # Get user's activity logs
    queryset = ActivityLog.objects.filter(user=request.user).select_related('category')
    
    # Apply date filters if provided
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if start_date:
        queryset = queryset.filter(date__gte=start_date)
    if end_date:
        queryset = queryset.filter(date__lte=end_date)
    
    queryset = queryset.order_by('-date')
    
    # Create PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#059669'),
        spaceAfter=6,
        alignment=1  # Center
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    elements.append(Paragraph("EcoTrack - Emissions Report", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Report info
    info_text = f"<b>User:</b> {request.user.username}<br/><b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
    if start_date and end_date:
        info_text += f"<b>Period:</b> {start_date} to {end_date}"
    elif start_date:
        info_text += f"<b>From:</b> {start_date}"
    elif end_date:
        info_text += f"<b>Until:</b> {end_date}"
    else:
        info_text += "<b>Period:</b> All time"
    
    elements.append(Paragraph(info_text, styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Activity table
    if queryset.exists():
        elements.append(Paragraph("Activity Logs", heading_style))
        
        # Prepare table data
        data = [['Date', 'Category', 'Quantity', 'Unit', 'CO2 (kg)', 'Note']]
        total_co2 = 0
        
        for log in queryset:
            data.append([
                log.date.strftime('%Y-%m-%d'),
                log.category.category,
                f"{log.quantity:.2f}",
                log.category.unit,
                f"{log.co2_total:.5f}",
                log.note or '-'
            ])
            total_co2 += float(log.co2_total)
        
        # Add total row
        data.append(['', '', '', '', f"{total_co2:.5f}", ''])
        
        # Create table
        table = Table(data, colWidths=[1*inch, 1.5*inch, 1*inch, 0.7*inch, 1*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f1f5f9')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f8fafc')]),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Summary
        elements.append(Paragraph("Summary", heading_style))
        summary_text = f"<b>Total Logs:</b> {len(data) - 2}<br/><b>Total CO2 Emissions:</b> {total_co2:.5f} kg"
        elements.append(Paragraph(summary_text, styles['Normal']))
    else:
        elements.append(Paragraph("No activity logs found for the selected period.", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    
    # Return PDF response
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    filename = f"emissions_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

