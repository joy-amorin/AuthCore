from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, PermissionViewSet
from .views import UserViewSet

# DefaultRouter: create automaticalli GET/api/roles, 
# POST/api/roles, GET/api/roles<id>, PUT/DELETE
router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'user', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]