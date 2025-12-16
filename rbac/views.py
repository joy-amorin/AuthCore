from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from .models import Permission, Role, RolePermission
from .serializers import PermissionSerializer, RoleSerializer
from .serializers import AssignPermissionsSerializer, RoleListSerializer

# only admins can manage permissions
class PermissionViewSet(viewsets.ModelViewSet): # create automatically  GET, POST, PUT, DELETE with Model Viewset
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return RoleListSerializer
        return super().get_serializer_class()

    # POST /api/roles/{id}/permissions/
    @action(detail=True, methods=['GET', 'POST'],
             url_path='permissions',
             serializer_class=AssignPermissionsSerializer)
    
    def assign_permissions(self, request, pk=None):
        role = self.get_object()

        if request.method == 'POST':

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            permissions_ids = serializer.validated_data['permissions']      

            for perm_id in permissions_ids:
                permission = get_object_or_404(Permission, id=perm_id)
                RolePermission.objects.get_or_create(
                    role=role,
                    permission=permission
                )

            return Response(
                {"detail": "Permisos asignados correctamente"},
                status=status.HTTP_200_OK
            )
        # GET 
        permissions = role.permissions.all()
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data)
