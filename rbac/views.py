from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from .models import Permission, Role, RolePermission
from .serializers import PermissionSerializer, RoleSerializer, RoleListSerializer
from .serializers import AssignPermissionsSerializer, RoleListSerializer
from .serializers import UserRoleSerializer, AssignRolesSerializer
from users.models import User
from users.serializers import UserSerializer
from .models import UserRole


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

    # POST GET /api/roles/{id}/permissions/
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
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_class = [permissions.IsAdminUser]

    @action(detail=True, methods=['GET'], url_path='roles')
    def roles(self, request, pk=None):
        """
        GET /user/{id}/role
        returns the roles associated with a user
        """
        user = self.get_object()
        roles = Role.objects.filter(role_assignments__user=user)
        serializer = RoleListSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
class UserRoleViewset(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    Permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args,**kwargs):
        """
        POST /user-roles
        assign a rol to a user
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data['user'].id)
        role = get_object_or_404(Role, id=serializer.validated_data['role'].id)

        # avoid duplicates
        user_role, created = UserRole.objects.get_or_create(user=user, role=role)

        if created:
            return Response({ "detail": "Rol asignado correctamente"}, status=status.HTTP_201_CREATED)
        else:
            return Response({ "detail": "La asignación ya existe"}, status=status.HTTP_200_OK)
        
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /user-role/{id}
        remove a role assignment from a user
        """

        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "Rol removido correctamente"}, status=status.HTTP_200_OK)