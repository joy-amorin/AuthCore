from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError


class LoginView(APIView):

    def post(self,  request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"] #obtein the refresh token from the body
            token = RefreshToken(refresh_token)
            token.blacklist() #mark as invalid
            return Response({"detail": "Logoutexitoso"}, status=status.HTTP_205_RESET_CONTENT)
        
        except KeyError:
            return Response({"error": "Refresh token requerido"})
        except TokenError:
            return Response({"error": "Token inválido o expirado"})

