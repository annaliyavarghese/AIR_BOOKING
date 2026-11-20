from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    PendingUsersView,
    ApproveUserView,
    RejectUserView,
    ProfileView
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('admin/users/pending/', PendingUsersView.as_view()),
    path('admin/users/<int:pk>/approve/', ApproveUserView.as_view()),
    path('admin/users/<int:pk>/reject/', RejectUserView.as_view()),
]