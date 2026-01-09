import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUsers } from "../api/get-users";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.permissions.includes("user.view")) {
        setError("You do not have permission to view users.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError("Error fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Users</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>First Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Last Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Roles</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}
            style={{ cursor: "pointer"}}
            onClick={() => navigate(`/panel/users/${u.id}`)}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.email}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.first_name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.last_name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.roles.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
