import { CustomerSignupForm } from "@/components/auth/customer-signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Sign up to manage orders, profile, and checkout faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
