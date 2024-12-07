import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { AuthNav } from "@/components/auth/auth-nav";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Document Management System",
  description: "Manage your documents efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <UserProvider>
          <QueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center px-6">
                  <div className="ml-auto">
                    <AuthNav />
                  </div>
                </header>
                <main className="flex-1 p-8">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </QueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}