import { AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { session } from "@/lib/session";

interface WidgetStateProps {
  mode: "error" | "empty";
  message: string;
  onRetry?: () => void;
}

const handleSignInAgain = () => {
  // Manual escape hatch when Retry keeps failing — usually means the
  // refresh token also expired, so the auto-redirect path in the axios
  // interceptor never fires. Wipe localStorage + access token and hard-
  // navigate to /login.
  session.clearSession();
  window.location.href = "/login";
};

export const WidgetState = ({ mode, message, onRetry }: WidgetStateProps) => {
  const Icon = mode === "error" ? AlertCircle : Database;

  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <Icon className={`h-8 w-8 ${mode === "error" ? "text-red-500" : "text-slate-400"}`} />
      <p className="text-sm text-slate-600">{message}</p>
      {mode === "error" ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <Button type="button" variant="outline" className="h-9 w-auto px-4" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
          <Button type="button" variant="outline" className="h-9 w-auto px-4" onClick={handleSignInAgain}>
            Sign in again
          </Button>
        </div>
      ) : null}
    </div>
  );
};
