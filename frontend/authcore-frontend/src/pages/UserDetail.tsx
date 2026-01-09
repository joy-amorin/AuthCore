import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById } from "../api/get-users";

const UserDetail = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
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
        if (id) {
          const data = await getUserById(id);
          setUser(data);
        }
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
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>First Name:</strong> {user.first_name}</p>
      <p><strong>Last Name:</strong> {user.last_name}</p>
      <p><strong>Roles:</strong> {user.roles.join(", ")}</p>

      {authUser?.permissions.includes("user.change") && (
        <button onClick={() => navigate(`/users/edit/${user.id}`)}>
          Edit User
        </button>
      )}
    </div>
  );
};

export default UserDetail;
