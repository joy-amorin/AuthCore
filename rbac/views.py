from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Permission, Role
from .serializers import PermissionSerializer, RolePermissionSerializer

# only admins can manage permissions
class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [permissions.IsAdminUser]
    
