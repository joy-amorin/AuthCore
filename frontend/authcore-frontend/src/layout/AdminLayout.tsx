// src/layout/AdminLayout.tsx
import { useContext } from "react";
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

interface AdminLayoutProps {
  children?: ReactNode;
}

// Definir menú del panel con roles permitidos
const menuItems = [
  { label: "Inicio", path: "home", roles: [] }, // visible para todos
  { label: "Usuarios", path: "users", roles: ["admin"] },
  { label: "Roles", path: "roles", roles: ["admin"] },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <div>Cargando...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 200, background: "#f5f5f5", padding: 20 }}>
        <h2>Panel</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map((item) => {
            if (
              item.roles.length === 0 ||
              item.roles.some((role) => user.roles.includes(role))
            ) {
              return (
                <li key={item.path} style={{ margin: "10px 0" }}>
                  <Link to={`/panel/${item.path}`}>{item.label}</Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <strong>{user.email}</strong> {user.is_superuser && "(Superusuario)"}
          </div>
          <button onClick={logout}>Logout</button>
        </header>

        {/* Rutas internas */}
        <section>
          {/* Si usás children, se renderiza aquí */}
          {children ? children : <Outlet />}
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
