
from rest_framework import serializers
from django.db import transaction
from .models import Booking
from flights.models import Flight


class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = [
            'id', 'flight', 'passengers', 'total_amount',
            'booking_status', 'payment_status', 'booking_date'
        ]
        read_only_fields = [
            'total_amount',
            'payment_status',
            'booking_date'
        ]

    def validate_passengers(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "At least 1 passenger is required."
            )
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        passengers = validated_data['passengers']

        if user.approval_status != 'Approved':
            raise serializers.ValidationError(
                "Your account is not approved."
            )

        with transaction.atomic():
            flight = Flight.objects.select_for_update().get(
                pk=validated_data['flight'].pk
            )

            if flight.available_seats < passengers:
                raise serializers.ValidationError(
                    "Not enough seats available."
                )

            flight.available_seats -= passengers
            flight.save()

            booking = Booking.objects.create(
                user=user,
                flight=flight,
                passengers=passengers,
                total_amount=flight.price * passengers,
                booking_status='Confirmed',
                payment_status='Pending'
            )

        return booking
