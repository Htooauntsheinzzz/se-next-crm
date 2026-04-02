"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editProfileSchema } from "@/lib/validations";
import type { UserUpdateRequest } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UserEditFormProps {
  initialValues: UserUpdateRequest;
  loading?: boolean;
  onCancel?: () => void;
  onSubmit: (data: UserUpdateRequest) => Promise<void>;
}

export const UserEditForm = ({
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: UserEditFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserUpdateRequest>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="firstName"
          label="First Name"
          placeholder="First name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          id="lastName"
          label="Last Name"
          placeholder="Last name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading} className="w-auto px-4">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
