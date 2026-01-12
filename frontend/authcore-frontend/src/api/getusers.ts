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
