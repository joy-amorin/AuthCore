from rest_framework.permissions import BasePermission
from rbac.services import has_permission
    
class CanViewUser(BasePermission):
    """
     Allows users to be viewed only if the user has the 'role.view' permission.
    """
    
    def has_permission(self, request, view):
        if view.action in ["list", "retrive"]:
            return has_permission(request.user, "user.view")
    
class CanViewRole(BasePermission):
    """
    Allows roles to be viewed only if the user has the 'user.view' permission.
    """
    def hass_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if view.action in ["list", "retrive"]:
            return has_permission(request.user, "role.view")
        
        return False
