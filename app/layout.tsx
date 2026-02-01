import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthButton } from "@/components/auth-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Expense Tracker | KES",
  description: "Track expenses and salary in Kenyan Shillings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <a href={session ? "/dashboard" : "/"} className="font-semibold">
                Expense Tracker
              </a>
              <AuthButton session={session} />
            </div>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
