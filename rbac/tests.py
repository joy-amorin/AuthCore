from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rbac.models import Role, Permission, RolePermission
from django.contrib.auth import get_user_model
import uuid
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RolePermissionTests(APITestCase):
    def setUp(self):
        # Create users
        self.superuser = User.objects.create_superuser(
            email='admin@joy.com', password='password'
        )
        self.normal_user = User.objects.create_user(
            email='user@joy.com', password='password'
        )

        # Create rol
        self.role = Role.objects.create(name="TestRole")

        # Create permissions
        self.permission1 = Permission.objects.create(name="perm1", description="perm1 desc")
        self.permission2 = Permission.objects.create(name="perm2", description="perm2 desc")
    
   
    
    # -------------------
    # Sucess Cases
    # -------------------
    def test_assign_permissions_success(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id), str(self.permission2.id)]}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.role.refresh_from_db()
        self.assertEqual(self.role.permissions.count(), 2)

    def test_delete_permissions_success(self):
        RolePermission.objects.create(role=self.role, permission=self.permission1)
        RolePermission.objects.create(role=self.role, permission=self.permission2)

        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-delete-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id)]}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.role.refresh_from_db()
        self.assertEqual(self.role.permissions.count(), 1)
        self.assertEqual(self.role.permissions.first().id, self.permission2.id)

    # -------------------
    # Failure Cases
    # -------------------
    def test_assign_permissions_unauthenticated(self):
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id)]}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_assign_permissions_forbidden(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id)]}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_permissions_nonexistent_permission(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-delete-permissions', args=[self.role.id])
        # Using a random UUID that does not exist
        data = {"permissions": ["00000000-0000-0000-0000-000000000000"]}

        response = self.client.post(url, data, format='json')
        # Should return 404 because get_object_or_404 fails
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_permissions_invalid_uuid(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": ["invalid-uuid"]}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_permissions_missing_field(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-delete-permissions', args=[self.role.id])
        data = {}  # Missing 'permissions' field

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_permissions_duplicate_ids(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id), str(self.permission1.id)]}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.role.refresh_from_db()
        # Should only assign unique permissions
        self.assertEqual(self.role.permissions.count(), 1)
    
class RolePermissionExtraTests(APITestCase):
    def setUp(self):
        # Users
        self.superuser = User.objects.create_superuser(email='admin@joy.com', password='password')
        self.normal_user = User.objects.create_user(email='user@joy.com', password='password')

        # Role
        self.role = Role.objects.create(name="ExtraTestRole")

        # Permissions
        self.permission1 = Permission.objects.create(name="perm1", description="perm1 desc")
        self.permission2 = Permission.objects.create(name="perm2", description="perm2 desc")
        self.permission3 = Permission.objects.create(name="perm3", description="perm3 desc")

    # -----------------------
    # GET /roles/{id}/permissions/
    # -----------------------
    def test_get_permissions(self):
        RolePermission.objects.create(role=self.role, permission=self.permission1)
        RolePermission.objects.create(role=self.role, permission=self.permission2)

        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertIn(self.permission1.name, [p['name'] for p in response.data])

    def test_get_permissions_nonexistent_role(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[uuid.uuid4()])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    # -----------------------
    # Superuser always allowed
    # -----------------------
    def test_superuser_can_assign_and_delete(self):
        self.client.force_authenticate(user=self.superuser)
        assign_url = reverse('role-assign-permissions', args=[self.role.id])
        delete_url = reverse('role-delete-permissions', args=[self.role.id])
        data = {"permissions": [str(self.permission1.id)]}

        # Assign
        response = self.client.post(assign_url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.role.refresh_from_db()
        self.assertTrue(self.permission1 in self.role.permissions.all())

        # Delete
        response = self.client.post(delete_url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.role.refresh_from_db()
        self.assertFalse(self.permission1 in self.role.permissions.all())

    # -----------------------
    # Mixed valid + invalid permissions
    # -----------------------
    def test_assign_mixed_valid_invalid_permissions(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        invalid_id = str(uuid.uuid4())
        data = {"permissions": [str(self.permission1.id), invalid_id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_delete_mixed_valid_invalid_permissions(self):
        RolePermission.objects.create(role=self.role, permission=self.permission1)
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-delete-permissions', args=[self.role.id])
        invalid_id = str(uuid.uuid4())
        data = {"permissions": [str(self.permission1.id), invalid_id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.role.refresh_from_db()
        self.assertTrue(self.permission1 in self.role.permissions.all())

    # -----------------------
    # Empty list edge case
    # -----------------------
    def test_assign_empty_permissions_list(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])
        data = {"permissions": []}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.role.permissions.count(), 0)

    def test_delete_empty_permissions_list(self):
        RolePermission.objects.create(role=self.role, permission=self.permission1)
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-delete-permissions', args=[self.role.id])
        data = {"permissions": []}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.role.refresh_from_db()
        self.assertTrue(self.permission1 in self.role.permissions.all())

    # -----------------------------------
    # Integrity after multiple surgeries
    # -----------------------------------
    def test_assign_delete_multiple_ops(self):
        self.client.force_authenticate(user=self.superuser)
        url = reverse('role-assign-permissions', args=[self.role.id])

        # Assign perm1 y perm2
        data = {"permissions": [str(self.permission1.id), str(self.permission2.id)]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.role.refresh_from_db()
        self.assertEqual(self.role.permissions.count(), 2)

        # Delete perm1
        url_delete = reverse('role-delete-permissions', args=[self.role.id])
        data_delete = {"permissions": [str(self.permission1.id)]}
        response = self.client.post(url_delete, data_delete, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify integrity
        self.role.refresh_from_db()
        self.assertEqual(self.role.permissions.count(), 1)
        self.assertEqual(self.role.permissions.first().id, self.permission2.id)

class AuthTests(APITestCase):

    def setUp(self):
        # Crear un usuario normal
        self.user = User.objects.create_user(
            email="user@joy.com",
            password="password123"
        )
        # Crear un superusuario
        self.superuser = User.objects.create_superuser(
            email="admin@joy.com",
            password="adminpass"
        )

    def test_login_success(self):
        url = reverse("token_obtain_pair")
        data = {"email": self.user.email, "password": "password123"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_fail_wrong_password(self):
        url = reverse("token_obtain_pair")
        data = {"email": self.user.email, "password": "wrongpass"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_me_unauthenticated(self):
        url = reverse("me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_success(self):
        refresh = RefreshToken.for_user(self.user)
        url = reverse("token_refresh")
        data = {"refresh": str(refresh)}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_token_fail_invalid(self):
        url = reverse("token_refresh")
        data = {"refresh": "invalidtoken123"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
