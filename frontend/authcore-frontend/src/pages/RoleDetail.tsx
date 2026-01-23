import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRoleById } from "../api/getroles";
import type { Role, Permission } from "../api/getroles";
import { ArrowLeft, Shield, Key, AlertCircle, Loader2 } from "lucide-react";

const RoleDetail = () => {
  const { user: authUser } = useAuth(); // se mantiene por coherencia futura
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const roleData = await getRoleById(id);
        setRole(roleData);
      } catch (err) {
        console.error(err);
        setError("Error fetching role details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO DETALLES...</span>
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

  if (!role) {
    return (
      <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-mono text-sm tracking-wide">
            ROL NO ENCONTRADO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate("/panel/roles")}
        className="flex items-center gap-2 text-green-400 font-mono text-sm mb-6 hover:text-green-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLVER A ROLES</span>
      </button>

      {/* Header */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              CLASIFICACIÓN: {role.name}
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              ID: {role.id}
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-400/20">
          <Key className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-mono text-green-400 tracking-wider m-0">
            PERMISOS ASIGNADOS
          </h2>
        </div>

        {role.permissions && role.permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {role.permissions.map((perm: Permission) => (
              <div
                key={perm.id}
                className="flex items-start gap-2 bg-slate-800/50 border border-green-400/20 p-3"
              >
                <span className="text-green-400/50 text-xs mt-0.5">►</span>
                <div className="flex-1">
                  <span className="text-green-400 font-mono text-sm tracking-wide">
                    {perm.description }
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm tracking-wide">
                No hay permisos asignados a este rol.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {role.permissions && role.permissions.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-green-400/50 font-mono text-xs tracking-wider">
            TOTAL DE PERMISOS: {role.permissions.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleDetail;