import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRoles, deleteRoleById } from "../api/getroles";
import type { Role } from "../api/getroles";

const RolesList = () => {
  const { user: authUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleDelete = async (roleId: string) => {
    if (!authUser?.permissions.includes("role.delete")) return;

    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRoleById(roleId);
      setRoles(roles.filter((r) => r.id !== roleId));
      alert("Role deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting role.");
    }
  };

  if (loading) return <div>Loading roles...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Roles</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
              {authUser?.permissions.includes("role.view") && (
                  <button onClick={() => navigate(`/panel/roles/${role.id}`)}>
                    Detail
                  </button>
                  )}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesList;
