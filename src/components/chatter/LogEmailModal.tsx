"use client";

import { useEffect } from "react";
import { Mail, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmailLogRequest } from "@/types/chatter";

const emailLogSchema = z.object({
  to: z.string().email("Invalid email").optional().or(z.literal("")),
  subject: z.string().max(255).optional().or(z.literal("")),
  body: z.string().min(1, "Email body is required"),
  type: z.enum(["EMAIL_SENT", "EMAIL_RECEIVED"]),
});

type EmailLogFormData = z.infer<typeof emailLogSchema>;

interface LogEmailModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: EmailLogRequest) => Promise<void>;
}

export const LogEmailModal = ({ open, loading, onClose, onSubmit }: LogEmailModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailLogFormData>({
    resolver: zodResolver(emailLogSchema),
    defaultValues: {
      to: "",
      subject: "",
      body: "",
      type: "EMAIL_SENT",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        to: "",
        subject: "",
        body: "",
        type: "EMAIL_SENT",
      });
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      to: values.to || undefined,
      subject: values.subject || undefined,
      body: values.body.trim(),
      type: values.type,
    });
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Mail className="h-4 w-4 text-slate-600" />
              Log Email
            </h3>
            <p className="mt-1 text-sm text-slate-500">Record an email interaction.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">To</label>
            <input
              {...register("to")}
              type="email"
              placeholder="recipient@example.com"
              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6FD0] transition focus:ring-2"
            />
            {errors.to ? <p className="mt-1 text-xs text-red-500">{errors.to.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Subject</label>
            <input
              {...register("subject")}
              placeholder="Email subject line"
              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6FD0] transition focus:ring-2"
            />
            {errors.subject ? <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Body *</label>
            <textarea
              {...register("body")}
              rows={4}
              placeholder="Email content..."
              className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#8B6FD0] transition focus:ring-2"
            />
            {errors.body ? <p className="mt-1 text-xs text-red-500">{errors.body.message}</p> : null}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Type</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input type="radio" value="EMAIL_SENT" {...register("type")} />
                Email Sent
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" value="EMAIL_RECEIVED" {...register("type")} />
                Email Received
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7A58BE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging..." : "Log Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
