from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_approval_email(user_email):
    send_mail(
        'Account Approved',
        'Your AirBooking account has been approved. You can now log in.',
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        fail_silently=False,
    )