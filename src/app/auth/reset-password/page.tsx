import { DashboardResetPasswordForm } from "@/components/auth/dashboard-reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Set a new password for your dashboard account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardResetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
