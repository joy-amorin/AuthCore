import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRoles, deleteRoleById } from "../api/getroles";
import type { Role } from "../api/getroles";
import { Shield, Eye, Trash2, AlertCircle, Loader2 } from "lucide-react";

const RolesList = () => {
  const { user: authUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleDelete = async (roleId: string) => {
    if (!authUser?.permissions.includes("role.delete")) return;

    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRoleById(roleId);
      setRoles(roles.filter((r) => r.id !== roleId));
      alert("Role deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting role.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO ROLES...</span>
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
          <Shield className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              CLASIFICACIONES
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              {roles.length} rol{roles.length !== 1 ? 'es' : ''} en sistema
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
                  NOMBRE
                </th>
                <th className="text-right text-green-400 tracking-wider px-6 py-4 font-normal">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-green-400/20 hover:bg-green-400/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400/90 tracking-wide">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {authUser?.permissions.includes("role.view") && (
                        <button
                          onClick={() => navigate(`/panel/roles/${role.id}`)}
                          className="flex items-center gap-2 border border-green-400/50 bg-green-400/10 hover:bg-green-400/20 text-green-400 px-3 py-1.5 transition-colors font-mono text-xs tracking-wide"
                        >
                          <Eye className="w-3 h-3" />
                          VER
                        </button>
                      )}

                      {authUser?.permissions.includes("role.delete") && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="flex items-center gap-2 border border-red-500/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 transition-colors font-mono text-xs tracking-wide"
                        >
                          <Trash2 className="w-3 h-3" />
                          ELIMINAR
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6 mt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm tracking-wide">
              NO HAY ROLES REGISTRADOS EN EL SISTEMA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;