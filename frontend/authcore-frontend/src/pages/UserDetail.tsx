import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById } from "../api/getusers";
import { ArrowLeft, Mail, User as UserIcon, Shield, Users, Edit, AlertCircle, Loader2 } from "lucide-react";

/**
 * Tipo que representa EXACTAMENTE lo que devuelve la API
 * para roles en /api/user/{id}
 */
type UserRole = {
  role__id: string;
  role__name: string;
};

/**
 * Tipo de usuario SOLO para vistas de gestión
 * (no se reutiliza AuthContext.User)
 */
type ApiUser = Omit<User, "roles"> & {
  roles: UserRole[];
};

const UserDetail = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
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

        if (!id) return;

        const data = await getUserById(id);

        console.log("UserDetail API response:", data);

        // casteo explícito y controlado
        setUser(data as ApiUser);
      } catch (err) {
        console.error(err);
        setError("Error fetching user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO DATOS DEL AGENTE...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-500/50 bg-red-950/20 p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-mono text-sm tracking-wide">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-mono text-sm tracking-wide">
            AGENTE NO ENCONTRADO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate("/panel/users")}
        className="flex items-center gap-2 text-green-400 font-mono text-sm mb-6 hover:text-green-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLVER A AGENTES</span>
      </button>

      {/* Header */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
                PERFIL DE AGENTE
              </h1>
              <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
                ID: {user.id}
              </p>
            </div>
          </div>

          {authUser?.permissions.includes("user.change") && (
            <button
              onClick={() => navigate(`/panel/users/edit/${user.id}`)}
              className="flex items-center gap-2 border border-green-400/50 bg-green-400/10 hover:bg-green-400/20 text-green-400 px-4 py-2 transition-colors font-mono text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>EDITAR</span>
            </button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-3 text-green-400/70">
            <Mail className="w-4 h-4" />
            <span className="font-mono text-xs tracking-wider">EMAIL</span>
          </div>
          <p className="font-mono text-green-400 text-lg m-0">{user.email}</p>
        </div>

        {/* First Name */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-3 text-green-400/70">
            <UserIcon className="w-4 h-4" />
            <span className="font-mono text-xs tracking-wider">NOMBRE</span>
          </div>
          <p className="font-mono text-green-400 text-lg m-0">
            {user.first_name || <span className="text-green-400/30">—</span>}
          </p>
        </div>

        {/* Last Name */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-3 text-green-400/70">
            <UserIcon className="w-4 h-4" />
            <span className="font-mono text-xs tracking-wider">APELLIDO</span>
          </div>
          <p className="font-mono text-green-400 text-lg m-0">
            {user.last_name || <span className="text-green-400/30">—</span>}
          </p>
        </div>

        {/* Roles */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-3 text-green-400/70">
            <Users className="w-4 h-4" />
            <span className="font-mono text-xs tracking-wider">CLASIFICACIÓN</span>
          </div>
          {user.is_superuser ? (
            <div className="inline-flex items-center gap-2 bg-green-400/20 border border-green-400/50 px-3 py-2 text-green-400 font-mono text-sm tracking-wide">
              <Shield className="w-4 h-4" />
              SUPERUSUARIO
            </div>
          ) : user.roles.length > 0 ? (
            <div className="space-y-2">
              {user.roles.map((role) => (
                <div
                  key={role.role__id}
                  className="flex items-center gap-2 bg-slate-800/50 border border-green-400/20 p-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-mono text-green-400 text-sm tracking-wide">
                    {role.role__name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-green-400/30 m-0">—</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;