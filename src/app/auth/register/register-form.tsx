"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { z } from "zod";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navig = useRouter();

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

    const result = registerSchema.safeParse(formData);

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
      const { confirmPassword, ...signUpData } = result.data;
      authClient.signUp.email(signUpData, {
        onError: (error) => {
          setIsLoading(false);
          sileo.error({
            title: "Registration failed",
            description:
              error?.error?.message || "An error occurred during registration",
          });
        },
        onSuccess: () => {
          setIsLoading(false);
          if (rememberMe) {
            localStorage.setItem("rememberEmail", signUpData.email);
          }

          sileo.success({
            title: "Registration successful",
            description:
              "Your account has been created successfully. Please check your email to verify your account.",
          });

          navig.push("/auth/login");
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      setErrors({
        form: error instanceof Error ? error.message : "Registration failed",
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            disabled={isLoading}
          />
          {errors.name && (
            <FieldDescription className="text-destructive">
              {errors.name}
            </FieldDescription>
          )}
        </Field>
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              disabled={isLoading}
            />
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password}
            </FieldDescription>
          )}
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <InputGroup>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!errors.confirmPassword}
              disabled={isLoading}
            />
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          {errors.confirmPassword && (
            <FieldDescription className="text-destructive">
              {errors.confirmPassword}
            </FieldDescription>
          )}
        </Field>

        <div className="flex items-center justify-end gap-4 rounded-lg px-3 py-2">
          <Switch
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked)}
            disabled={isLoading}
          />
          <FieldLabel
            htmlFor="rememberMe"
            className="font-normal cursor-pointer"
          >
            Remember me
          </FieldLabel>
        </div>

        <Field>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading && <Spinner className="size-4" />}
            {isLoading ? "Creating account..." : "Register"}
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
            Sign up with Google
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
