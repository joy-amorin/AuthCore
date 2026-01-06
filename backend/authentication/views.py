from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # get the refresh token sent from the frontend
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)

            # mark as revoked
            token.blacklist()

            return Response({"detail": "Logout exitoso"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


