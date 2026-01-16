import { useContext } from "react";
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

interface AdminLayoutProps {
  children?: ReactNode;
}
const menuItems = [
  { label: "Inicio", path: "home" },
  { label: "Usuarios", path: "users", permission: "user.view" },
  { label: "Alta de Usuarios", path: "register", permission: "user.add" },
  { label: "Roles", path: "roles", permission: "role.view" },
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
            if (!item.permission || user.permissions.includes(item.permission)) {
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

      {/* Main content */}
      <main style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <strong>{user.email}</strong> {user.is_superuser && "(Superusuario)"}
          </div>
          <button onClick={logout}>Logout</button>
        </header>

        {/* Internal routes */}
        <section>
          {children ? children : <Outlet />}
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
