
from django.urls import path

from .views import (
    BookingListCreateView,
    BookingDetailView,
    PaymentView,
    AdminBookingListView
)

urlpatterns = [
    path('', BookingListCreateView.as_view()),
    path('<int:pk>/', BookingDetailView.as_view()),
    path('payment/<int:booking_id>/', PaymentView.as_view(), name='payment'),

    # SUPERUSER - VIEW ALL BOOKINGS
    path('admin/all/', AdminBookingListView.as_view()),
]