import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAuditLogs } from "../api/audit";
import type { AuditLog } from "../api/audit";
import { FileText, AlertCircle, Loader2, Clock, User, Activity, Database, FileEdit } from "lucide-react";

const AuditLogList = () => {
  const { user: authUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;

    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError("Error loading audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO REGISTROS...</span>
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
          <FileText className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              REGISTRO DE AUDITORÍA
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              {logs.length} evento{logs.length !== 1 ? 's' : ''} registrado{logs.length !== 1 ? 's' : ''}
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
                <th className="text-left text-green-400 tracking-wider px-4 py-4 font-normal">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    FECHA
                  </div>
                </th>
                <th className="text-left text-green-400 tracking-wider px-4 py-4 font-normal">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    USUARIO
                  </div>
                </th>
                <th className="text-left text-green-400 tracking-wider px-4 py-4 font-normal">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    ACCIÓN
                  </div>
                </th>
                <th className="text-left text-green-400 tracking-wider px-4 py-4 font-normal">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    ENTIDAD
                  </div>
                </th>
                <th className="text-left text-green-400 tracking-wider px-4 py-4 font-normal">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4" />
                    CAMBIOS
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-green-400/20 hover:bg-green-400/5 transition-colors"
                >
                  <td className="px-4 py-4 text-green-400/90 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-green-400/90">
                    <span className={log.user_email ? "" : "text-green-400/50 italic"}>
                      {log.user_email || "System"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block bg-slate-800/50 border border-green-400/30 px-3 py-1 text-green-400 text-xs tracking-wide">
                      {log.action_display}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-green-400/90">
                    {log.model_display}
                  </td>
                  <td className="px-4 py-4">
                    {log.changes && Object.keys(log.changes).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(log.changes).map(([field, change]) => (
                          <div
                            key={field}
                            className="text-xs text-green-400/70 bg-slate-800/30 border border-green-400/20 px-2 py-1"
                          >
                            {typeof change === "object" && change !== null && "from" in change ? (
                              <>
                                <span className="text-green-400/50">{field}:</span>{" "}
                                <span className="text-red-400/70">{change.from ?? "—"}</span>
                                {" → "}
                                <span className="text-green-400">{change.to ?? "—"}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-green-400/50">{field}:</span>{" "}
                                <span className="text-green-400">{String(change)}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-400/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6 mt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm tracking-wide">
              NO HAY EVENTOS REGISTRADOS EN EL SISTEMA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogList;