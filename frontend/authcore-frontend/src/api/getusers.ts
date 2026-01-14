import { apiFetch } from "./client";
import type { User } from "../auth/AuthContext";

export const getUsers = async (): Promise<User[]> => {
  try {
    const users: User[] = await apiFetch("/api/user");
    return users;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const user: User = await apiFetch(`/api/user/${id}`);
    return user;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};

export const updateUser = async (
  userId: string,
  data: {
    first_name: string;
    last_name: string;
  }
) => {
  try {
    const updatedUser = await apiFetch(`/api/user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return updatedUser;
  } catch (err: any) {
    console.error(`Error updating user ${userId}:`, err);
    throw new Error(err?.message || "Failed to update user");
  }
};
export const deleteUser = async (userId: string) => {
  try {
    return await apiFetch(`/api/user/${userId}/`, {
      method: "DELETE",
    });
  } catch (err: any) {
    console.error(`Error deleting user ${userId}:`, err);
    throw new Error(err?.message || "Failed to delete user");
  }
};


