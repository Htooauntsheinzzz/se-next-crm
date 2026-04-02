"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { editProfileSchema } from "@/lib/validations";
import type { UserUpdateRequest } from "@/types/user";

interface EditProfileFormProps {
  initialValues: UserUpdateRequest;
  loading?: boolean;
  onSubmit: (values: UserUpdateRequest) => Promise<void>;
}

export const EditProfileForm = ({
  initialValues,
  loading = false,
  onSubmit,
}: EditProfileFormProps) => {
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
    <form className="space-y-3" onSubmit={handleSubmit((values) => onSubmit(values))}>
      <Input
        id="profile-first-name"
        label="First Name"
        placeholder="Enter first name"
        error={errors.firstName?.message}
        {...register("firstName")}
      />
      <Input
        id="profile-last-name"
        label="Last Name"
        placeholder="Enter last name"
        error={errors.lastName?.message}
        {...register("lastName")}
      />
      <Button type="submit" loading={loading} className="w-auto px-4">
        Save Profile
      </Button>
    </form>
  );
};
