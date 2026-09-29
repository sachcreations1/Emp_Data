import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import AppBackground from "@/components/AppBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StaffLink",
  description: "Manage Employee IDs with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-dvh bg-transparent antialiased", inter.className)}>
        <AppBackground />
        <div className="relative z-10 min-h-dvh bg-transparent">
          <main className="min-h-dvh bg-transparent">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
