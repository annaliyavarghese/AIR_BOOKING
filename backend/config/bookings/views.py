
from django.db import transaction
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer
from flights.models import Flight
from accounts.permissions import IsSuperUser


# USER BOOKINGS - LIST AND CREATE
class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# USER BOOKING DETAILS - UPDATE AND DELETE
class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(
                pk=serializer.instance.pk,
                user=self.request.user
            )

            if 'flight' in serializer.validated_data or 'passengers' in serializer.validated_data:
                raise serializers.ValidationError(
                    "Flight and passenger details cannot be changed."
                )

            old_status = booking.booking_status
            new_status = serializer.validated_data.get(
                'booking_status', old_status
            )

            if old_status == 'Cancelled' and new_status != 'Cancelled':
                raise serializers.ValidationError(
                    "Cancelled booking cannot be confirmed again."
                )

            serializer.instance = booking
            serializer.save()

            if old_status != 'Cancelled' and new_status == 'Cancelled':
                flight = Flight.objects.select_for_update().get(
                    pk=booking.flight_id
                )

                flight.available_seats = min(
                    flight.available_seats + booking.passengers,
                    flight.total_seats
                )
                flight.save(update_fields=['available_seats'])

                if booking.payment_status == 'Paid':
                    booking.payment_status = 'Refund Pending'
                    booking.save(update_fields=['payment_status'])

    def perform_destroy(self, instance):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(
                pk=instance.pk,
                user=self.request.user
            )

            if booking.payment_status in ['Paid', 'Refund Pending']:
                raise serializers.ValidationError(
                    "Paid bookings cannot be deleted. Cancel the booking instead."
                )

            if booking.booking_status != 'Cancelled':
                flight = Flight.objects.select_for_update().get(
                    pk=booking.flight_id
                )
                flight.available_seats = min(
                    flight.available_seats + booking.passengers,
                    flight.total_seats
                )
                flight.save(update_fields=['available_seats'])

            booking.delete()


# PAYMENT
class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(
                    id=booking_id,
                    user=request.user
                )
            except Booking.DoesNotExist:
                return Response(
                    {"error": "Booking not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if booking.booking_status == 'Cancelled':
                return Response(
                    {"error": "Cancelled booking cannot be paid"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if booking.payment_status == 'Paid':
                return Response(
                    {"message": "Already paid"},
                    status=status.HTTP_200_OK
                )

            if booking.payment_status != 'Pending':
                return Response(
                    {"error": "Payment is not available for this booking"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking.payment_status = 'Paid'
            booking.save(update_fields=['payment_status'])

            return Response({
                "message": "Payment successful",
                "booking_id": booking.id,
                "payment_status": booking.payment_status,
                "amount": booking.total_amount
            })


# ADMIN - VIEW ALL USERS' BOOKINGS
class AdminBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        return Booking.objects.select_related(
            'user', 'flight'
        ).all().order_by('-booking_date')
