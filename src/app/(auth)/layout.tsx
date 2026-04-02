"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#8B6FD0]">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/35 border-t-white" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#8B6FD0] px-4 py-10">
      <div className="pointer-events-none absolute -left-28 top-14 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-[#6F4DB7]/40 blur-3xl" />

      <div className="relative w-full max-w-[640px]">
        <Brand />
        <div className="mt-8 rounded-2xl bg-white px-6 py-8 shadow-[0_25px_55px_-20px_rgba(41,13,94,0.5)] sm:px-10 sm:py-9">
          {children}
        </div>
      </div>
    </div>
  );
}
