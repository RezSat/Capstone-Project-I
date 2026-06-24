"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestDashboardPasswordReset } from "@/modules/auth/dashboard-forgot-password.service";
import type { DashboardForgotPasswordErrors } from "@/modules/auth/dashboard-forgot-password.types";

export function DashboardForgotPasswordForm() {
  const submissionLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<DashboardForgotPasswordErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setMessage("");
    setErrors({});
    setIsSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await requestDashboardPasswordReset({
        email: String(formData.get("email") ?? ""),
      });

      setErrors(result.errors);
      setMessage(result.message);
      setIsSuccess(result.isSuccess);
    } catch {
      setMessage("Unable to send reset email. Please try again.");
      setErrors({});
      setIsSuccess(false);
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form aria-busy={isSubmitting} className="space-y-4" noValidate onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={isSubmitting}
          id="email"
          name="email"
          placeholder="you@company.com"
          type="email"
        />
        {errors.email ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send Reset Email"}
      </Button>

      {message ? (
        <p
          aria-live="polite"
          className={isSuccess ? "text-sm text-primary" : "text-sm text-destructive"}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link className="text-primary underline-offset-4 hover:underline" href="/auth/login">
          Back to login
        </Link>
      </p>
    </form>
  );
}
