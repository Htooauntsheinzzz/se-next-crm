"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addNoteSchema = z.object({
  body: z.string().min(1, "Note is required"),
});

type AddNoteFormData = z.infer<typeof addNoteSchema>;

interface AddNoteFormProps {
  loading: boolean;
  onSubmit: (body: string) => Promise<void>;
}

export const AddNoteForm = ({ loading, onSubmit }: AddNoteFormProps) => {
  const [focused, setFocused] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddNoteFormData>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: {
      body: "",
    },
  });

  const body = watch("body");
  const showAction = useMemo(() => focused || body.trim().length > 0, [body, focused]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values.body.trim());
    reset({ body: "" });
    setFocused(false);
  });

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-3">
      <textarea
        {...register("body")}
        onFocus={() => setFocused(true)}
        rows={showAction ? 3 : 2}
        placeholder="Write a note..."
        className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#8B6FD0] transition focus:ring-2"
      />
      {errors.body ? <p className="mt-1 text-xs text-red-500">{errors.body.message}</p> : null}

      {showAction ? (
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-8 items-center rounded-md bg-[#8B6FD0] px-3 text-xs font-semibold text-white transition hover:bg-[#7A58BE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post Note"}
          </button>
        </div>
      ) : null}
    </form>
  );
};
