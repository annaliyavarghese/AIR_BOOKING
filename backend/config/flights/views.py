from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Flight
from .serializers import FlightSerializer
from .opensky import get_flight_status

class FlightListView(generics.ListAPIView):
    serializer_class = FlightSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        flights = Flight.objects.all()

        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')

        if source:
            flights = flights.filter(source__icontains=source)

        if destination:
            flights = flights.filter(destination__icontains=destination)

        if date:
            flights = flights.filter(departure_date=date)

        return flights.filter(available_seats__gt=0)

class FlightDetailView(generics.RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [AllowAny]

class AdminFlightListView(generics.ListCreateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAdminUser]

class AdminFlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAdminUser]


class FlightStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        return self.update_status(request, pk)

    def patch(self, request, pk):
        return self.update_status(request, pk)

    def update_status(self, request, pk):
        try:
            flight = Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return Response(
                {'error': 'Flight not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('status')

        if new_status not in ['On-time', 'Delayed', 'Cancelled']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        flight.status = new_status
        flight.save(update_fields=['status'])

        return Response({
            'message': 'Flight status updated',
            'flight_id': flight.id,
            'status': flight.status
        })
class LiveFlightStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            flight = Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return Response(
                {'error': 'Flight not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        live_data = get_flight_status(flight.flight_number)

        return Response({
            'flight_number': flight.flight_number,
            'airline': flight.airline,
            'scheduled_status': flight.status,
            'live_status': live_data
        })