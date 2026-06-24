import { createDashboardBrowserClient } from "../../core/auth/dashboard-browser-client";
import { dashboardForgotPasswordSchema } from "./dashboard-forgot-password.schema";
import type {
  DashboardForgotPasswordErrors,
  DashboardForgotPasswordInput,
  DashboardForgotPasswordResult,
} from "./dashboard-forgot-password.types";

function getFieldErrors(input: DashboardForgotPasswordInput): DashboardForgotPasswordErrors {
  const parsed = dashboardForgotPasswordSchema.safeParse(input);

  if (parsed.success) {
    return {};
  }

  return {
    email: parsed.error.flatten().fieldErrors.email?.[0],
  };
}

function getResetPasswordRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/auth/reset-password`;
}

export async function requestDashboardPasswordReset(
  input: DashboardForgotPasswordInput,
): Promise<DashboardForgotPasswordResult> {
  const errors = getFieldErrors(input);

  if (errors.email) {
    return {
      isSuccess: false,
      message: "Please correct the form fields and try again.",
      errors,
    };
  }

  const supabase = createDashboardBrowserClient();
  const redirectTo = getResetPasswordRedirectUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(
    input.email,
    redirectTo ? { redirectTo } : undefined,
  );

  if (error) {
    return {
      isSuccess: false,
      message: "Unable to send reset email. Please try again.",
      errors: {},
    };
  }

  return {
    isSuccess: true,
    message: "If the email exists, a password reset link has been sent.",
    errors: {},
  };
}
