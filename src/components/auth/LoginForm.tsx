"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/validations";
import type { LoginFormData } from "@/types/auth";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EyeIcon, LockIcon, MailIcon } from "@/components/ui/icons";

export const LoginForm = () => {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    setErrorMessage(null);

    const result = await login(data.email, data.password);

    if (!result.success) {
      setErrorMessage(result.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-[42px]">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500">Sign in to continue to Sales Surge</p>
      </div>

      {errorMessage ? (
        <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@company.com"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<LockIcon />}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon />
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" loading={submitting}>
          Sign In
        </Button>
      </form>

      <div className="space-y-4 text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-[#7D62C1] hover:underline">
          Forgot password?
        </Link>

        <div className="border-t border-slate-200 pt-4 text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#7D62C1] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};
