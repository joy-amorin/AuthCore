import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRoleById, deleteRoleById } from "../api/getroles";
import type { Role, Permission } from "../api/getroles";
import { getPermissions } from "../api/getpermissions";

const RoleDetail = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // retrieve role details
        const roleData = await getRoleById(id);
        setRole(roleData);

        // set selected permissions as Permission[]
        setSelectedPermissions(roleData.permissions || []);

        // retrieve all available permissions
        const perms = await getPermissions();
        setAllPermissions(perms);
      } catch (err) {
        console.error(err);
        setError("Error fetching role details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePermissionChange = (perm: Permission) => {
    setSelectedPermissions(prev =>
      prev.some(p => p.id === perm.id)
        ? prev.filter(p => p.id !== perm.id)
        : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!authUser?.permissions.includes("role.change")) return;
    if (!role) return;

    try {
      setSaving(true);
      // call PUT/PATCH API to update role permissions

      alert("Rol actualizado (simulación)");
      setRole({ ...role, permissions: selectedPermissions });
    } catch (err) {
      console.error(err);
      alert("Error saving role changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!authUser?.permissions.includes("role.delete") || !role) return;

    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRoleById(role.id);
      alert("Role deleted successfully.");
      navigate("/panel/roles");
    } catch (err) {
      console.error(err);
      alert("Error deleting role.");
    }
  };

  if (loading) return <div>Loading role details...</div>;
  if (error) return <div>{error}</div>;
  if (!role) return <div>No role found.</div>;

  return (
    <div>
      <h1>Role Detail: {role.name}</h1>

      <h2>Permissions</h2>
      <div>
        {allPermissions.map((perm) => (
          <label key={perm.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedPermissions.some(p => p.id === perm.id)}
              disabled={!authUser?.permissions.includes("role.change")}
              onChange={() => handlePermissionChange(perm)}
            />
            {perm.description || perm.name}
          </label>
        ))}
      </div>

      {authUser?.permissions.includes("role.change") && (
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}

      {authUser?.permissions.includes("role.delete") && (
        <button onClick={handleDelete} style={{ marginLeft: "1rem", color: "red" }}>
          Delete Role
        </button>
      )}
    </div>
  );
};

export default RoleDetail;
