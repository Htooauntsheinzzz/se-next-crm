import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Sales Surge",
  description: "Sales Surge CRM frontend authentication",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
