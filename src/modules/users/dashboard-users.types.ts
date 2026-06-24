import { z } from "zod";
import type { DashboardUserRole } from "../../core/auth/rbac-permissions";

export const createDashboardUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().max(40, "Phone is too long").optional(),
  role: z.enum(["super_admin", "admin", "operator", "viewer"]).default("viewer"),
});

export type CreateDashboardUserInput = z.infer<typeof createDashboardUserSchema>;

export const updateDashboardUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["super_admin", "admin", "operator", "viewer"]),
});

export type UpdateDashboardUserRoleInput = z.infer<typeof updateDashboardUserRoleSchema>;

export const toggleDashboardUserActiveSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  isActive: z.boolean(),
});

export type ToggleDashboardUserActiveInput = z.infer<typeof toggleDashboardUserActiveSchema>;

export type DashboardUserItem = {
  id: string;
  userId: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardUsersListData = {
  items: DashboardUserItem[];
  status: "ready" | "error";
  isEmpty: boolean;
};
