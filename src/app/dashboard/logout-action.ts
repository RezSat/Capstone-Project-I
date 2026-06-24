"use server";

import { redirect } from "next/navigation";
import { logoutDashboardUser } from "@/modules/auth/dashboard-logout.service";

export async function logoutDashboardAction() {
  await logoutDashboardUser();
  redirect("/");
}
