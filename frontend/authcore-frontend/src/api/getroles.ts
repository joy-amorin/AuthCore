import { apiFetch } from "./client";

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[]; // list of permission codenames
}

// get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const roles: Role[] = await apiFetch("/api/roles/");
    return roles;
  } catch (err) {
    console.error("Error fetching roles:", err);
    throw err;
  }
};

// get role by id
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const role: Role = await apiFetch(`/api/roles/${id}/`);
    return role;
  } catch (err) {
    console.error("Error fetching role:", err);
    throw err;
  }
};

// delete role by id
export const deleteRoleById = async (id: string) => {
  try {
    await apiFetch(`/api/roles/${id}/`, { method: "DELETE" });
    return true;
  } catch (err) {
    console.error("Error deleting role:", err);
    throw err;
  }
};
export const removeRoleFromUser = async (userId: string, roleId: string) => {
  try {
    await apiFetch("/api/user_role/remove_role/", {
      method: "POST",
      body: JSON.stringify({ user: userId, role: roleId }),
    });
    return true;
  } catch (err) {
    console.error(`Error removing role ${roleId} from user ${userId}:`, err);
    throw err;
  }
};
