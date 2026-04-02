"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  loading?: boolean;
  onSubmit: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export const ChangePasswordForm = ({
  loading = false,
  onSubmit,
}: ChangePasswordFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: ChangePasswordValues) => {
    await onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    reset();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit((values) => submit(values))}>
      <Input
        id="currentPassword"
        label="Current Password"
        type="password"
        placeholder="Enter current password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <Input
        id="newPassword"
        label="New Password"
        type="password"
        placeholder="Enter new password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <p className="-mt-1 text-xs text-slate-400">Minimum 6 characters</p>
      <Input
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Confirm new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" loading={loading} className="w-auto px-4">
        Update Password
      </Button>
    </form>
  );
};
