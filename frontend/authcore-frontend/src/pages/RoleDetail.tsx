import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRoleById } from "../api/getroles";
import type { Role, Permission } from "../api/getroles";

const RoleDetail = () => {
  const { user: authUser } = useAuth(); // se mantiene por coherencia futura
  const { id } = useParams<{ id: string }>();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const roleData = await getRoleById(id);
        setRole(roleData);
      } catch (err) {
        console.error(err);
        setError("Error fetching role details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  if (loading) return <div>Loading role details...</div>;
  if (error) return <div>{error}</div>;
  if (!role) return <div>No role found.</div>;

  return (
    <div>
      <h1>Role Detail: {role.name}</h1>

      <h2>Permissions</h2>

      {role.permissions && role.permissions.length > 0 ? (
        <ul>
          {role.permissions.map((perm: Permission) => (
            <li key={perm.id}>
              {perm.description || perm.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No permissions assigned to this role.</p>
      )}
    </div>
  );
};

export default RoleDetail;
