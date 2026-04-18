import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export const ForbiddenState = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-md mx-auto mt-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <ShieldAlert className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-slate-900">
        You don&apos;t have access to this team
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        This team isn&apos;t in your scope. Ask an admin if you believe this is a mistake.
      </p>
      <Link
        href="/teams"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
      >
        Back to Teams
      </Link>
    </div>
  );
};
