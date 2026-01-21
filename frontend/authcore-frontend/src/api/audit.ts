import { apiFetch } from "./client";


export interface AuditLog {
  id: number;
  user: string | null;
  user_email: string | null;
  model_name: string;
  model_display: string;
  object_id: string;
  action: string;
  action_display: string;
  timestamp: string;
  changes: Record<string, any>;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    return await apiFetch("/api/audit-logs/");
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    throw err;
  }
};
