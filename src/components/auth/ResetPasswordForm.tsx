"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeftIcon, EyeIcon, LockIcon } from "@/components/ui/icons";
import { authApi } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { resetPasswordSchema } from "@/lib/validations";
import type { ResetPasswordFormData } from "@/types/auth";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
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
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("token", token);
  }, [token, setValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setAlert({
        type: "error",
        message: "Reset token is missing or invalid",
      });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const response = await authApi.confirmPasswordReset(data.token, data.newPassword);

      if (!response.data.success) {
        setAlert({
          type: "error",
          message: response.data.message || "Unable to reset password",
        });
        setSubmitting(false);
        return;
      }

      setAlert({
        type: "success",
        message: response.data.message || "Password has been reset. Redirecting to login...",
      });

      timeoutRef.current = setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error) {
      setAlert({
        type: "error",
        message: getApiErrorMessage(error, "Unable to reset password"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-[42px]">
          Set a new password
        </h2>
        <p className="text-sm text-slate-500">Choose a secure new password for your account</p>
      </div>

      {alert ? (
        <Alert
          type={alert.type}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("token")} />

        <Input
          id="newPassword"
          type={showPassword ? "text" : "password"}
          label="New Password"
          placeholder="Enter new password"
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
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="Confirm your new password"
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
          Reset Password
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-[#7D62C1] hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
