// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Retrieve user data using apiClient
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch("/api/me"); // profile endpoint
        setUser(data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("No se pudo cargar el perfil");
        // if token fails, redirect to login
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  // Logout: clears tokens and returns to login
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Cargando perfil...</div>;

  return (
    <div>
      <h1>Bienvenido, {user.email}</h1>
      <p>¡Login exitoso!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
