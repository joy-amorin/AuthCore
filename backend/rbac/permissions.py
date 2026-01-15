from rest_framework.permissions import BasePermission
from rbac.services import has_permission
    
class RBACPermission(BasePermission):
   """
   Generic permmission based in RBAC
   """
   permission_map = {}

   def has_permission(self, request, view):
      if not request.user or not request.user.is_authenticated:
         return False
      
      required_permission = self.permission_map.get(view.action)
      if not required_permission:
         return False
      return has_permission(request.user, required_permission)
   
class UserPermission(RBACPermission):
      """
      RBAC permissions for the user resource
      """
      permission_map = {
        'retrieve': 'user.view',
        'list': 'user.view',
        'create': 'user.add',
        'update': 'user.change',
        'partial_update': 'user.change',
        'destroy': 'user.delete',
        'roles': 'assign.role',
        'roles': 'user_role.delete'
      }

class RolePermission(RBACPermission):
      """
      RBAC permissions for the Role resource
      """
      permission_map = {
        'retrieve': 'role.view',
        'list': 'role.view',
        'create': 'role.add',
        'update': 'role.change',
        'partial_update': 'role.change',
        'destroy': 'role.delete',
        "assign_permissions": "role.view", 
      }

      def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
          return False
        if request.user.is_superuser:
               return True
           
        required_permission = self.permission_map.get(view.action)
        if not required_permission:
          return False
           
        if view.action == "assign_permissions":
          if request.method == "GET":
            required_permission = "role.view"
          elif request.method == "POST":
            required_permission = "role.change"
        return has_permission(request.user, required_permission)

class PermissionPermission(RBACPermission):
      """
      RBAC permissions for the Permission resource
      """
      permission_map = {
        'retrieve': 'permission.view',
        'list': 'permission.view',
        'create': 'permission.add',
        'update': 'permission.change',
        'partial_update': 'permission.change',
        'destroy': 'permission.delete',
        
      }