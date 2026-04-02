"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeftIcon, MailIcon } from "@/components/ui/icons";
import { authApi } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { forgotPasswordSchema } from "@/lib/validations";
import type { ForgotPasswordFormData } from "@/types/auth";

export const ForgotPasswordForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitting(true);
    setAlert(null);

    try {
      const response = await authApi.requestPasswordReset(data.email);

      if (!response.data.success) {
        setAlert({
          type: "error",
          message: response.data.message || "Unable to process your request",
        });
        setSubmitting(false);
        return;
      }

      setAlert({
        type: "success",
        message: "If an account exists with this email, a reset link has been sent",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: getApiErrorMessage(error, "Unable to process your request"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-[42px]">
          Reset your password
        </h2>
        <p className="text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset token
        </p>
      </div>

      {alert ? (
        <Alert
          type={alert.type}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
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

        <Button type="submit" loading={submitting}>
          Reset
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
