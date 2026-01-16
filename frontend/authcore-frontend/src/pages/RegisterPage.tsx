import { useState } from "react";
import { apiFetch } from "../api/client";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // basis validations
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // validations before sending
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      console.log("Registered user:", response);
      setSuccess(`User ${response.email} registered successfully!`);

      // clear form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err?.status === 400 && err?.errors?.email) {
        setError(`Email already registered: ${err.errors.email.join(", ")}`);
      } else {
        setError(
          err?.message || "Error registering user. Please check your data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Register New User</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            required
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem",
            backgroundColor: "#9340ff",
            color: "#fff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
