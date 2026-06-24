"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeDashboardPasswordReset } from "@/modules/auth/dashboard-reset-password.service";
import type { DashboardResetPasswordErrors } from "@/modules/auth/dashboard-reset-password.types";

export function DashboardResetPasswordForm() {
  const submissionLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<DashboardResetPasswordErrors>({});

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
      const result = await completeDashboardPasswordReset({
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });
      setErrors(result.errors);
      setMessage(result.message);
      setIsSuccess(result.isSuccess);
    } catch {
      setMessage("Unable to reset password. Please try again.");
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
        <label className="text-sm font-medium" htmlFor="password">
          New Password
        </label>
        <Input
          aria-invalid={Boolean(errors.password)}
          autoComplete="new-password"
          disabled={isSubmitting}
          id="password"
          name="password"
          type="password"
        />
        {errors.password ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.password}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <Input
          aria-invalid={Boolean(errors.confirmPassword)}
          autoComplete="new-password"
          disabled={isSubmitting}
          id="confirmPassword"
          name="confirmPassword"
          type="password"
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
      {message ? (
        <p aria-live="polite" className={isSuccess ? "text-sm text-primary" : "text-sm text-destructive"} role="alert">
          {message}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Return to{" "}
        <Link className="text-primary underline-offset-4 hover:underline" href="/auth/login">
          login
        </Link>
      </p>
    </form>
  );
}
