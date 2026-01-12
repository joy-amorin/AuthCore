import { apiFetch } from "./client";

export interface Permission {
  id: string;
  name: string;      // Descripción legible, ej: "Ver usuarios"
  description: string;  // Código interno, ej: "user.view"
}

// Obtener todos los permisos
export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const permissions: Permission[] = await apiFetch("/api/permissions/");
    return permissions;
  } catch (err) {
    console.error("Error fetching permissions:", err);
    throw err;
  }
};
