import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById } from "../api/getusers";

/**
 * Tipo que representa EXACTAMENTE lo que devuelve la API
 * para roles en /api/user/{id}
 */
type UserRole = {
  role__id: string;
  role__name: string;
};

/**
 * Tipo de usuario SOLO para vistas de gestión
 * (no se reutiliza AuthContext.User)
 */
type ApiUser = Omit<User, "roles"> & {
  roles: UserRole[];
};

const UserDetail = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser?.permissions.includes("user.view")) {
        setError("You do not have permission to view this user.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (!id) return;

        const data = await getUserById(id);

        console.log("UserDetail API response:", data);

        // casteo explícito y controlado
        setUser(data as ApiUser);
      } catch (err) {
        console.error(err);
        setError("Error fetching user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser, id]);

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user found.</div>;

  return (
    <div>
      <h1>User Detail</h1>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>First Name:</strong> {user.first_name || "—"}
      </p>

      <p>
        <strong>Last Name:</strong> {user.last_name || "—"}
      </p>

      <div>
        <strong>Roles:</strong>
        {user.is_superuser ? (
          <span> Superuser</span>
        ) : user.roles.length > 0 ? (
          <ul>
            {user.roles.map((role) => (
              <li key={role.role__id}>{role.role__name}</li>
            ))}
          </ul>
        ) : (
          <span> —</span>
        )}
      </div>

      {authUser?.permissions.includes("user.change") && (
        <button onClick={() => navigate(`/panel/users/edit/${user.id}`)}>
          Edit User
        </button>
      )}
    </div>
  );
};

export default UserDetail;
