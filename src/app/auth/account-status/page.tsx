import Link from "next/link";

export default function AccountStatusPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">Account setup required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is signed in, but no active staff or customer profile is available yet.
        </p>
        <p className="mt-4 text-sm">
          Please contact support or try again later. Return to <Link className="underline" href="/auth/login">login</Link>.
        </p>
      </section>
    </main>
  );
}
