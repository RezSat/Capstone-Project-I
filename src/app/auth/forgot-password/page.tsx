import { DashboardForgotPasswordForm } from "@/components/auth/dashboard-forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Request a password reset email for your dashboard account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
