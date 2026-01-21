import { useContext } from "react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { Shield, Home, Users, UserPlus, Lock, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children?: ReactNode;
}

const menuItems = [
  { label: "Inicio", path: "home", icon: Home },
  { label: "Usuarios", path: "users", permission: "user.view", icon: Users },
  { label: "Alta de Usuarios", path: "register", permission: "user.add", icon: UserPlus },
  { label: "Roles", path: "roles", permission: "role.view", icon: Lock },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm tracking-wider">CARGANDO...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-green-400/30 text-green-400"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static
          w-64 h-screen
          bg-slate-900 border-r-2 border-green-400/30
          transition-transform duration-300
          z-40
          overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Logo/Header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-green-400/20">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-green-400 font-mono text-lg tracking-wider">PANEL</h2>
              <p className="text-green-400/50 font-mono text-xs">SISTEMA SEGURO</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                if (!item.permission || user.permissions.includes(item.permission)) {
                  const isActive = location.pathname === `/panel/${item.path}`;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={`/panel/${item.path}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3
                          font-mono text-sm tracking-wide
                          border transition-colors
                          ${isActive 
                            ? 'bg-green-400/20 border-green-400/50 text-green-400' 
                            : 'bg-slate-800/30 border-green-400/20 text-green-400/70 hover:bg-green-400/10 hover:text-green-400'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-900 border-b-2 border-green-400/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 ml-12 lg:ml-0">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="font-mono text-green-400">
                <span className="text-sm tracking-wide">AGENTE: </span>
                <strong className="text-base">{user.email}</strong>
                {user.is_superuser && (
                  <span className="ml-2 text-xs bg-green-400/20 border border-green-400/50 px-2 py-0.5">
                    SUPERUSUARIO
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 border border-red-500/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 px-4 py-2 transition-colors font-mono text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">DESCONECTAR</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children ? children : <Outlet />}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-green-400/20 p-4">
          <div className="max-w-7xl mx-auto text-center text-green-400/30 font-mono text-xs tracking-widest">
            <p>// SISTEMA DE SEGURIDAD v2.0 - CLASIFICADO //</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;