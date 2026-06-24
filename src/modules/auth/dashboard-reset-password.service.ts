import { createDashboardBrowserClient } from "../../core/auth/dashboard-browser-client";
import { clientEnv } from "../../core/env/client";
import { dashboardResetPasswordSchema } from "./dashboard-reset-password.schema";
import type {
  DashboardResetPasswordErrors,
  DashboardResetPasswordInput,
  DashboardResetPasswordResult,
} from "./dashboard-reset-password.types";

function getFieldErrors(input: DashboardResetPasswordInput): DashboardResetPasswordErrors {
  const parsed = dashboardResetPasswordSchema.safeParse(input);

  if (parsed.success) {
    return {};
  }

  return {
    password: parsed.error.flatten().fieldErrors.password?.[0],
    confirmPassword: parsed.error.flatten().fieldErrors.confirmPassword?.[0],
  };
}

async function hasRecoverySession(client: ReturnType<typeof createDashboardBrowserClient>) {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");

    if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);

      if (!error) {
        return true;
      }
    }

    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      const { error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!error) {
        return true;
      }
    }
  }

  const { data } = await client.auth.getSession();
  return Boolean(data.session);
}

async function updatePasswordWithRecoveryToken(password: string, accessToken: string) {
  const response = await fetch(`${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (response.ok) {
    return "success";
  }

  if (response.status === 401 || response.status === 403) {
    return "invalid";
  }

  return "failure";
}

export async function completeDashboardPasswordReset(
  input: DashboardResetPasswordInput,
): Promise<DashboardResetPasswordResult> {
  const errors = getFieldErrors(input);

  if (errors.password || errors.confirmPassword) {
    return {
      isSuccess: false,
      message: "Please correct the form fields and try again.",
      errors,
    };
  }

  const supabase = createDashboardBrowserClient();
  const hashParams =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.hash.replace("#", ""));
  const recoveryAccessToken = hashParams.get("access_token");
  const canResetPassword = await hasRecoverySession(supabase);

  if (!canResetPassword && recoveryAccessToken) {
    const fallbackResult = await updatePasswordWithRecoveryToken(
      input.password,
      recoveryAccessToken,
    );

    if (fallbackResult === "success") {
      return {
        isSuccess: true,
        message: "Password updated successfully.",
        errors: {},
      };
    }

    if (fallbackResult === "failure") {
      return {
        isSuccess: false,
        message: "Unable to reset password. Please try again.",
        errors: {},
      };
    }
  }

  if (!canResetPassword) {
    return {
      isSuccess: false,
      message: "Reset link is invalid or expired.",
      errors: {},
    };
  }

  const { error } = await supabase.auth.updateUser({ password: input.password });

  if (error) {
    return {
      isSuccess: false,
      message: "Unable to reset password. Please try again.",
      errors: {},
    };
  }

  return {
    isSuccess: true,
    message: "Password updated successfully.",
    errors: {},
  };
}
