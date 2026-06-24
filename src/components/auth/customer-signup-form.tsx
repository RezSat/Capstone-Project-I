"use client";

import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerSignupAction } from "@/app/actions/customer-signup";
import type { CustomerSignupFormErrors } from "@/modules/auth/customer-signup.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomerSignupForm() {
  const router = useRouter();
  const submissionLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<CustomerSignupFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLockRef.current) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setMessage("");
    setErrors({});
    try {
      const formData = new FormData(event.currentTarget);
      const result = await customerSignupAction({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (!result.isSuccess) {
        setErrors(result.errors);
        setMessage(result.message);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        router.replace("/");
        return;
      }
      setMessage("Unable to create account. Please try again.");
      setErrors({});
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form aria-busy={isSubmitting} className="space-y-4" noValidate onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
        <Input aria-invalid={Boolean(errors.firstName)} disabled={isSubmitting} id="firstName" name="firstName" />
        {errors.firstName ? <p className="text-sm text-destructive">{errors.firstName}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
        <Input aria-invalid={Boolean(errors.lastName)} disabled={isSubmitting} id="lastName" name="lastName" />
        {errors.lastName ? <p className="text-sm text-destructive">{errors.lastName}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="phone">Phone (optional)</label>
        <Input aria-invalid={Boolean(errors.phone)} autoComplete="tel" disabled={isSubmitting} id="phone" name="phone" />
        {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <Input aria-invalid={Boolean(errors.email)} autoComplete="email" disabled={isSubmitting} id="email" name="email" type="email" />
        {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <Input aria-invalid={Boolean(errors.password)} autoComplete="new-password" disabled={isSubmitting} id="password" name="password" type="password" />
        {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Creating..." : "Create Account"}</Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <p className="text-sm text-muted-foreground">Already have an account? <Link className="text-primary underline-offset-4 hover:underline" href="/auth/login">Sign in</Link></p>
    </form>
  );
}
