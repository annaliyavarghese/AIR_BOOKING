
from django.contrib.auth import get_user_model

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, LoginSerializer
from .tasks import send_approval_email
from .permissions import IsSuperUser
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer, ProfileSerializer

User = get_user_model()

# USER PROFILE
class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
# USER REGISTRATION
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# USER LOGIN
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


# VIEW PENDING USERS - SUPERUSER ONLY
class PendingUsersView(generics.ListAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        return User.objects.filter(approval_status='Pending')


# APPROVE USER - SUPERUSER ONLY
class ApproveUserView(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.approval_status = 'Approved'
        user.save()

        send_approval_email.delay(user.email)

        return Response({
            'message': 'User approved successfully'
        })


# REJECT USER - SUPERUSER ONLY
class RejectUserView(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.approval_status = 'Rejected'
        user.save()

        return Response({
            'message': 'User rejected successfully'
        })
