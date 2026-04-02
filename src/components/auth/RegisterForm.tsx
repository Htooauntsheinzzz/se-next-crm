"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EyeIcon, MailIcon, LockIcon, UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { registerSchema } from "@/lib/validations";
import type { RegisterFormData } from "@/types/auth";

export const RegisterForm = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitting(true);
    setAlert(null);

    const result = await registerUser(data);

    if (!result.success) {
      setAlert({ type: "error", message: result.message });
      setSubmitting(false);
      return;
    }

    setAlert({
      type: "success",
      message: result.message || "Account created successfully. Redirecting to login...",
    });

    timeoutRef.current = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-[42px]">
          Create Account
        </h2>
        <p className="text-sm text-slate-500">Get started with Sales Surge</p>
      </div>

      {alert ? (
        <Alert
          type={alert.type}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="firstName"
            type="text"
            label="First Name"
            placeholder="John"
            autoComplete="given-name"
            icon={<UserIcon />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <Input
            id="lastName"
            type="text"
            label="Last Name"
            placeholder="Doe"
            autoComplete="family-name"
            icon={<UserIcon />}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

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
          placeholder="Create a password"
          autoComplete="new-password"
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

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          icon={<LockIcon />}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="rounded text-slate-400 hover:text-slate-600"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon />
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={submitting}>
          Create Account
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#7D62C1] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
