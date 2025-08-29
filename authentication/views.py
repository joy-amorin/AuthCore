from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer, RoleSerializer, PermissionSerializer
from .serializers import UserRoleSerializer, RolePermissionSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.exceptions import TokenError
from.models import Role, Permission, UserRole, RolePermission


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
            return Response({"detail": "Logout exitoso"}, status=status.HTTP_205_RESET_CONTENT)
        
        except KeyError:
            return Response({"error": "Refresh token requerido"})
        except TokenError:
            return Response({"error": "Token inválido o expirado"})

#---------------------
# Roles Viwes
#---------------------

class RolesViews(APIView):
    permission_classes = [IsAdminUser] # Only the admin can create/list

    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = RoleSerializer(data= request.data)
        if serializer.ias_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RolesDatailView(APIView):
    permission_classes = [IsAdminUser]

    def get_objects(self, pk):
        try:
            return Role.objects.get(pk)
        except Role.DoesNotExist:
            return None
    
    def get(self, request, pk):
        role = self.get_objects(pk)
        if not role:
            return Response({'detail': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role)
        return Response(serializer.data)
    
    def put(self, request, pk):
        role = self.get_objects(pk)
        if not role:
            return Response({'deatil': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role, data=request.dat)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        role = self.get_objects(pk)
        if not role:
            return Response({'detail': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        role.delete()
        return Response({'detail': 'Rol eliminado'}, status=status.HTTP_204_NOT_CONTENT)

#---------------------
# Permissions Viwes
#---------------------
    
class PermissionsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self,request):
        permission = Permission.objects.all()
        serializer = PermissionSerializer(permission, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PermissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PermissionDeatilViews(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Permission.objects.get(pk=pk)
        except Permission.DoesNotExist:
            return None
    
    def get(self, request, pk):
        permissions = self.get_object(pk)
        if not permissions:
            return Response({'detail': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PermissionSerializer(permissions)
        return Response(serializer.data)
    
    def put(self, request, pk):
        permission = self.get_object(pk)
        if not permission:
            return Response({'detail': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PermissionSerializer(permission, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        permission = self.get_object(pk)
        if not permission:
            return Response({'detail': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        permission.delete()
        return Response({'detail': 'Permiso eliminado'}, status=status.HTTP_204_NO_CONTENT)
    
#---------------------
# UserRoles Viwes
#---------------------

class UserRoleListCreateView(APIView):
    def get(self, request):
        user_roles = UserRole.objects.all()
        serializer = UserRoleSerializer(user_roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = UserRoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, satus=status.HTTP_400_BAD_REQUEST)
    
class UserRoleDetailView(APIView):
    def get(self, request, pk):
        try:
             user_role = UserRole.objects.get(pk=pk)
        except UserRole.DoesNotExist:
            return Response({'detail': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserRoleSerializer(user_role)
        return Response(serializer.data)
        

    def put(self, request, pk):
        user_role = UserRole.objects.get(pk)
        if not user_role:
            return Response({'detail': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserRoleSerializer(user_role, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        user_role =UserRole.objects.get(pk)
        if not user_role:
            return Response({'detail': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        user_role.delete()
        return Response({'detail': 'Asignación eliminada'}, status=status.HTTP_204_NOT_CONTENT)
    
#----------------------
# RolePermissions Viwes
#----------------------

class RolePermissionsListCreateView(APIView):
    def get(self, request):
        role_permission = RolePermission.objects.all()
        serializer = RolePermissionSerializer(role_permission, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = RolePermissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RolePermissionsDetailView(APIView):
    def get(self, request, pk):
        try:
            role_permission = RolePermission.objects.get(pk)
        except RolePermission.DoesNotExist:
            return Response({'detail': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RolePermissionSerializer(role_permission)
        return Response(serializer.data)
    
    def put(self,  request, pk):
        try: 
            role_permission = RolePermission.objects.get(pk=pk)
        except RolePermission.DoesNotExist:
            return Response({'detail': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RolePermissionSerializer(role_permission, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            role_permission = RolePermission.objects.get(pk)
        except RolePermission.DoesNotExist:
            return Response({'detail': 'Asignación no encontrada'},status=status.HTTP_404_NOT_FOUND)
        role_permission.delete()
        return Response({'detail': 'Asignación eliminada'}, status=status.HTTP_204_NO_CONTENT)
