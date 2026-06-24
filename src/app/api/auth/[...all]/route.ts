import { toNextJsHandler } from "better-auth/next-js";
import { dashboardAuth } from "@/core/auth/better-auth";

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(dashboardAuth);
