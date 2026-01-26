import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Shield, Key, Users, LogOut, AlertCircle } from "lucide-react";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm tracking-wider">CARGANDO PERFIL...</span>
        </div>
      </div>
    );
  }

  console.log("User en Home:", user);

  return (
    <div className="min-h-screen bg-slate-950 text-green-400 font-mono p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl tracking-wider">ACCESO AUTORIZADO</h1>
                <p className="text-green-400/70 text-sm mt-1">AGENTE: {user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 border border-red-500/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 px-4 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">DESCONECTAR</span>
            </button>
          </div>

          {/* Superuser Badge */}
          {user.is_superuser && (
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-400/50 p-3 mt-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm tracking-wide">
                ¡Eres superusuario! Tienes todos los permisos.
              </span>
            </div>
          )}
        </div>

        {/* Roles and Permissions */}
        {user.roles.length > 0 && (
          <div>
            {/* Roles Section */}
            <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 border-b border-green-400/20 pb-2">
                <Users className="w-5 h-5" />
                <p className="text-lg tracking-wider m-0">TUS ROLES:</p>
              </div>
              <ul className="list-none p-0 m-0 grid grid-cols-1 gap-2">
                {user.roles.map((role, index) => (
                  <li
                    key={role.role__id || role.role__name || index}
                    className="flex items-center gap-2 bg-slate-800/50 border border-green-400/20 p-3"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm tracking-wide">{role.role__name || "Sin nombre"}</span>
                  </li>
                ))}

              </ul>

            </div>

            {/* Permissions Section */}
            <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 border-b border-green-400/20 pb-2">
                <Key className="w-5 h-5" />
                <p className="text-lg tracking-wider m-0">PERMISOS:</p>
              </div>
              <ul className="list-none p-0 m-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                {user.permissions.map((perm) => (
                  <li
                    key={perm.name}
                    className="flex items-start gap-2 bg-slate-800/50 border border-green-400/20 p-2"
                  >
                    <span className="text-green-400/50 text-xs mt-0.5">►</span>
                    <span className="text-xs tracking-wide">{perm.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* No Roles Warning */}
        {user.roles.length === 0 && !user.is_superuser && (
          <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400 text-sm tracking-wide m-0">
                No tienes roles asignados.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-green-400/30 text-xs tracking-widest">
          <p>// SISTEMA DE SEGURIDAD v2.0 - CLASIFICADO //</p>
        </div>
      </div>
    </div>
  );
};

export default Home;