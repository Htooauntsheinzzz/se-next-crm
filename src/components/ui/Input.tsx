import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
}

export const Input = ({
  label,
  error,
  icon,
  endAdornment,
  className = "",
  id,
  ...props
}: InputProps) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold tracking-tight text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={`h-11 w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-slate-200 focus:border-[#8B6DD0] focus:ring-[#D4C4FA]"
          } ${icon ? "pl-10" : "pl-3.5"} ${endAdornment ? "pr-10" : "pr-3.5"} ${className}`}
          {...props}
        />
        {endAdornment ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {endAdornment}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};
