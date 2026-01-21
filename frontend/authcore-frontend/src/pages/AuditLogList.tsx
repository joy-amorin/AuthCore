import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAuditLogs } from "../api/audit";
import type { AuditLog } from "../api/audit";

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

  if (loading) return <div>Loading audit logs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Auditoría</h1>

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Cambios</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user_email || "System"}</td>
              <td>{log.action_display}</td>
              <td>{log.model_display}</td>
              <td>
                {log.changes && Object.keys(log.changes).length > 0
                  ? Object.entries(log.changes).map(([field, change]) => (
                      <div key={field}>
                        {typeof change === "object" && change !== null && "from" in change
                          ? `${field}: ${change.from ?? "—"} → ${change.to ?? "—"}`
                          : `${field}: ${change}`}
                      </div>
                    ))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogList;
