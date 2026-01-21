from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from .models import Permission, Role, RolePermission as RolePermissionModel
from .serializers import PermissionSerializer, RoleSerializer, RoleListSerializer
from .serializers import AssignPermissionsSerializer, RoleListSerializer
from .serializers import UserRoleSerializer
from users.models import User
from users.serializers import UserSerializer
from .models import UserRole
from .permissions import UserPermission, RolePermission, PermissionPermission
from audit.models import AuditLog



class PermissionViewSet(viewsets.ModelViewSet): # create automatically  GET, POST, PUT, DELETE with Model Viewset
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [PermissionPermission]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions')
    serializer_class = RoleSerializer
    permission_classes = [RolePermission]

    #-------------------------------
    # Assign permissions to role
    #-------------------------------
    @action(detail=True, methods=['GET', 'POST'],
             url_path='permissions',
             serializer_class=AssignPermissionsSerializer)
    
    def assign_permissions(self, request, pk=None):
        role = self.get_object()
        
    #-------------------------------
    # POST: assign permissions to role
    #-------------------------------
        if request.method == 'POST':

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            permissions_ids = serializer.validated_data['permissions']      

            for perm_id in permissions_ids:
                permission = get_object_or_404(Permission, id=perm_id)
                RolePermissionModel.objects.get_or_create(
                    role=role,
                    permission=permission
                )

            return Response(
                {"detail": "Permisos asignados correctamente"},
                status=status.HTTP_200_OK
            )
    #-------------------------------
    # GET: list permissions
    # -------------------------------
        permissions = role.permissions.all()
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) 
        
    #-------------------------------
    # Delete permissions from role
    #-------------------------------
    @action(detail=True, methods=['POST'], #Swagger does not handle the body for delete well for this reason I used POST -_-
        url_path='permissions/delete',
        serializer_class=AssignPermissionsSerializer
        )
    def delete_permissions(self, request, pk=None):
        role = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        permissions_ids = serializer.validated_data['permissions']
        permission_qs = Permission.objects.filter(id__in=permissions_ids)

        if permission_qs.count() != len(permissions_ids):
            return Response(
                {"detail": "Uno o más permisos no existen"},
                status=status.HTTP_400_BAD_REQUEST
            )
        #validate empty list
        if not permissions_ids:
            return Response(
                {"detail": "No se enviaron permisos para eliminar"},
                status=status.HTTP_200_OK)

        RolePermissionModel.objects.filter(
            role=role,
            permission__id__in=permissions_ids
        ).delete()

        return Response(
            {"detail": "Permisos removidos correctamente",
             "permissions": [p.name for p in role.permissions.all()]},
            status=status.HTTP_200_OK
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermission]

    def perform_create(self, serializer):
        serializer.save(_current_user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        before = {
            field: getattr(instance, field)
            for field in serializer.validated_data.keys()
        }

        for field, value in serializer.validated_data.items():
            setattr(instance, field, value)


        instance._current_user = self.request.user
        instance._changes = {
            field: {
                "from": before[field],
                "to": getattr(instance, field)
            }
            for field in before
            if before[field] != getattr(instance,field)
        }
        instance.save()

    
    def perform_destroy(self, instance):      
        instance._current_user = self.request.user

        instance._changes = {
            "id": str(instance.id),
            "repr": str(instance),
        }
        instance.delete()


    @action(detail=True, methods=['GET'], url_path='roles')
    def roles(self, request, pk=None):
        """
        GET /users/{id}/roles
        returns the roles associated with a user
        """
        user = self.get_object()
        roles = Role.objects.filter(role_assignments__user=user)
        serializer = RoleListSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
class UserRoleViewset(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    Permission_classes = [UserPermission]

    def perform_create(self, serializer):
        serializer.save(_current_user=self.request.user)

    def perform_update(self, serializer):   
        serializer.save(_current_user=self.request.user)     
    
    def perform_destroy(self, instance):
        
        instance._current_user = self.request.user
        instance.delete()


    def create(self, request, *args,**kwargs):
        """
        POST /user-roles
        assign a rol to a user
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data['user'].id)
        role = get_object_or_404(Role, id=serializer.validated_data['role'].id)

        user_role = UserRole.objects.filter(user=user, role=role).first()

        if not user_role:
            user_role = UserRole(user=user, role=role)
            user_role._current_user = request.user
            user_role.save()
            return Response({ "detail": "Rol asignado correctamente"}, status=status.HTTP_201_CREATED)
        else:
            return Response({ "detail": "La asignación ya existe"}, status=status.HTTP_200_OK)
        
    @action(detail=False, methods=['POST'], url_path='remove_role')  #Swagger does not handle the body for delete well for this reason I used POST -_-
    def remove_role(self, request):
        """
        Remove a role from a user using user_id and role_id
        POST /user_role/remove-role
        Body: { "user": "<user_id>", "role": "<role_id>" }
        """

        user_id = request.data.get("user")
        role_id = request.data.get("role")

        if not user_id or not role_id:
            return Response(
                {"detail": "Se deben enviar user y role"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_role = UserRole.objects.get(user__id=user_id, role__id=role_id)
        except UserRole.DoesNotExist:
            return Response({
                "detail": "No existe la asignación de rol para este usuario"},
                status=status.HTTP_404_NOT_FOUND
            )
        user_role._current_user = request.user
        user_role.delete()
        return Response({
            "detail": "Rol removido correctamente"},
            status=status.HTTP_200_OK)