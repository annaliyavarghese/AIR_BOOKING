
from django.urls import path
from .views import (
    FlightListView,
    FlightDetailView,
    AdminFlightListView,
    AdminFlightDetailView,
    FlightStatusUpdateView,
    LiveFlightStatusView,
)

urlpatterns = [
    path('search/', FlightListView.as_view()),
    path('admin/', AdminFlightListView.as_view()),
    path('admin/<int:pk>/', AdminFlightDetailView.as_view()),
    path('admin/<int:pk>/status/', FlightStatusUpdateView.as_view()),
    path('<int:pk>/live-status/', LiveFlightStatusView.as_view()),
    path('<int:pk>/', FlightDetailView.as_view()),
]