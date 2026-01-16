import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById, updateUser, deleteUser } from "../api/getusers";
import { getRoles, removeRoleFromUser } from "../api/getroles";
import type { Role } from "../api/getroles";
import { apiFetch } from "../api/client";

const UserEdit = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.permissions.includes("user.change")) {
      setError("You do not have permission to edit users.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (!id) return;

        const data = await getUserById(id);
        setUser(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");

        const formattedRoles =
          data.roles?.map((r: any) => ({
            id: r.role__id,
            name: r.role__name,
          })) || [];
        setUserRoles(formattedRoles);

        setSelectedRole(formattedRoles[0]?.id || null);

        const allRoles = await getRoles();
        setRoles(allRoles);
      } catch (err) {
        console.error(err);
        setError("Error fetching user or roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, id]);


  const canDeleteRole = authUser?.permissions.some((p) =>
    p.toLowerCase().includes("user_role.delete")
  );

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateUser(user.id, { first_name: firstName, last_name: lastName });
      navigate(`/panel/users/${user.id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!authUser?.permissions.includes("user.delete")) return;

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(user.id);
      alert("User deleted successfully.");
      navigate("/panel/users");
    } catch (err) {
      console.error(err);
      alert("Error deleting user.");
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;
    if (!authUser?.permissions.includes("assign.role")) return;

    try {
      setRoleSaving(true);
      await apiFetch("/api/user_role/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ user: user.id, role: selectedRole }),
      });

      alert("Role assigned successfully.");
      const assignedRole = roles.find((r) => r.id === selectedRole);
      if (assignedRole) {
        setUserRoles((prev) => [...prev, { id: assignedRole.id, name: assignedRole.name }]);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning role.");
    } finally {
      setRoleSaving(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!user) return;
    if (!canDeleteRole) return;

    if (!confirm("Are you sure you want to remove this role from the user?")) return;

    try {
      setRoleSaving(true);
      await removeRoleFromUser(user.id, roleId);
      alert("Role removed successfully.");
      setUserRoles((prev) => prev.filter((r) => r.id !== roleId));
      if (selectedRole === roleId) setSelectedRole(null);
    } catch (err) {
      console.error(err);
      alert("Error removing role.");
    } finally {
      setRoleSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <h1>Edit User</h1>

      <div>
        <label>Email</label>
        <input type="email" value={user.email} disabled />
      </div>

      <div>
        <label>First Name</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>

      <div>
        <label>Last Name</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {authUser?.permissions.includes("user.delete") && (
        <button onClick={handleDelete} style={{ marginLeft: "1rem", color: "red" }}>
          Delete User
        </button>
      )}

      {/* assigned roles */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Current Roles:</h3>
        <ul>
          {userRoles.map((role) => (
            <li key={role.id || role.name}>
              {role.name}
              {canDeleteRole && (
                <button
                  onClick={() => handleRemoveRole(role.id)}
                  disabled={roleSaving}
                  style={{ marginLeft: "0.5rem", color: "red" }}
                >
                  {roleSaving ? "Removing..." : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Assign roles */}
      {authUser?.permissions.includes("assign.role") && (
        <div style={{ marginTop: "1.5rem" }}>
          <label>Assign Role:</label>
          <select value={selectedRole || ""} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">-- Select a role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignRole}
            disabled={roleSaving || !selectedRole}
            style={{ marginLeft: "0.5rem" }}
          >
            {roleSaving ? "Assigning..." : "Assign Role"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserEdit;
