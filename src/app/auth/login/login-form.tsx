"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { z } from "zod";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      const errors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, value]) => {
        errors[key] = (value as string[])[0] || "Validation error";
      });
      setErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      authClient.signIn.email(
        {
          email: result.data.email,
          password: result.data.password,
        },
        {
          onError: (error) => {
            setIsLoading(false);
            sileo.error({
              title: "Login failed",
              description: error?.error?.message || "Invalid email or password",
            });
          },
          onSuccess: () => {
            setIsLoading(false);
            sileo.success({
              title: "Login successful",
              description: "Welcome back! Redirecting to dashboard...",
            });
            router.push("/");
          },
        },
      );
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      setErrors({
        form: error instanceof Error ? error.message : "Login failed",
      });
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        {errors.form && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <FieldDescription className="text-destructive">
              {errors.form}
            </FieldDescription>
          </div>
        )}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            disabled={isLoading}
          />
          {errors.email && (
            <FieldDescription className="text-destructive">
              {errors.email}
            </FieldDescription>
          )}
        </Field>
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
            disabled={isLoading}
          />
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading && <Spinner className="size-4" />}
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" disabled={isLoading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24"
              height="24"
            >
              <title>Google</title>
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
              />
            </svg>
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
