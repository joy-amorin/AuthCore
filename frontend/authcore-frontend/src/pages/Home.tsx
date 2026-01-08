import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <div>Cargando perfil...</div>;

  return (
    <div>
      <h1>Bienvenido, {user.email}</h1>

      {user.is_superuser && (
        <p>¡Eres superusuario! Tienes todos los permisos.</p>
      )}

      {user.roles.length > 0 && (
        <div>
          <p>Tus roles:</p>
          <ul>
            {user.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      )}

      {user.roles.length === 0 && !user.is_superuser && (
        <p>No tienes roles asignados.</p>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
