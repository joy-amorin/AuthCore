import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById, updateUser, deleteUser } from "../api/getusers";

const UserEdit = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.permissions.includes("user.change")) {
      setError("You do not have permission to edit users.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        if (!id) return;

        const data = await getUserById(id);
        setUser(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      } catch (err) {
        console.error(err);
        setError("Error fetching user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser, id]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      await updateUser(user.id, {
        first_name: firstName,
        last_name: lastName,
      });

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
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label>Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {authUser?.permissions.includes("user.delete") && (
        <button
          onClick={handleDelete}
          style={{ marginLeft: "1rem", color: "red" }}
        >
          Delete User
        </button>
      )}
    </div>
  );
};

export default UserEdit;
