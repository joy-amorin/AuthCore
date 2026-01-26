import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUsers } from "../api/getusers";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, Shield, Loader2 } from "lucide-react";

interface UserRole {
  role__id: string;
  role__name: string;
}

interface ApiUser extends Omit<User, "roles"> {
  roles: UserRole[];
}

const UsersPage = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate(); 
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!authUser?.permissions.some(p => p.name === "user.view")) {
        setError("You do not have permission to view users.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const usersData = await getUsers();
        const formattedUsers: ApiUser[] = usersData.map((u: any) => ({
          ...u,
          roles: Array.isArray(u.roles)
            ? u.roles.filter((r: any): r is UserRole => r && typeof r === "object")
            : [],
        }));
        console.log("Formatted users with roles:", formattedUsers);
        setUsers(formattedUsers);
      } catch (err) {
        console.error(err);
        setError("Error fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO AGENTES...</span>
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

  return (
    <div>
      {/* Header */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              REGISTRO DE AGENTES
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              {users.length} agente{users.length !== 1 ? 's' : ''} en sistema
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b-2 border-green-400/30 bg-slate-800/50">
                <th className="text-left text-green-400 tracking-wider px-6 py-4 font-normal">
                  EMAIL
                </th>
                <th className="text-left text-green-400 tracking-wider px-6 py-4 font-normal">
                  NOMBRE
                </th>
                <th className="text-left text-green-400 tracking-wider px-6 py-4 font-normal">
                  APELLIDO
                </th>
                <th className="text-left text-green-400 tracking-wider px-6 py-4 font-normal">
                  CLASIFICACIÓN
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => navigate(`/panel/users/${u.id}`)}
                  className="border-b border-green-400/20 hover:bg-green-400/10 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-green-400/90">{u.email}</td>
                  <td className="px-6 py-4 text-green-400/90">{u.first_name}</td>
                  <td className="px-6 py-4 text-green-400/90">{u.last_name}</td>
                  <td className="px-6 py-4">
                    {u.is_superuser ? (
                      <span className="inline-flex items-center gap-2 bg-green-400/20 border border-green-400/50 px-3 py-1 text-green-400 text-xs tracking-wide">
                        <Shield className="w-3 h-3" />
                        SUPERUSUARIO
                      </span>
                    ) : u.roles.length > 0 ? (
                      <span className="text-green-400/70 text-xs tracking-wide">
                        {u.roles.map((r) => r.role__name).join(", ")}
                      </span>
                    ) : (
                      <span className="text-green-400/30 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6 mt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm tracking-wide">
              NO HAY AGENTES REGISTRADOS EN EL SISTEMA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;