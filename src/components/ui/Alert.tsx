import type { ReactNode } from "react";

interface AlertProps {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
  icon?: ReactNode;
}

export const Alert = ({ type, message, onDismiss, icon }: AlertProps) => {
  const classes =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${classes}`}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {icon ? <span className="mt-0.5">{icon}</span> : null}
        <p>{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium opacity-80 hover:opacity-100"
          aria-label="Dismiss alert"
        >
          Close
        </button>
      ) : null}
    </div>
  );
};
