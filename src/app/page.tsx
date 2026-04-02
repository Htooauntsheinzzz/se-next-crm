"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#8B6FD0]">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/35 border-t-white" />
    </div>
  );
}
