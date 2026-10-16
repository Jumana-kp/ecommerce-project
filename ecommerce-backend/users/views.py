from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data["refresh"]

                token = RefreshToken(refresh_token)
                token.blacklist()

                return Response(
                    {
                        "message": "Logout successful."
                    },
                    status=status.HTTP_200_OK
                )

            except Exception:
                return Response(
                    {
                        "message": "Invalid refresh token."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )