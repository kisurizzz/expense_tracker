import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SignInButton } from "@/components/sign-in-button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Suri's Expense Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your salary and expenses in Kenyan Shillings (KES). Set a
            monthly budget, log fixed and variable expenses, and see your
            savings rate.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <SignInButton />
        </div>
        <p className="text-xs text-muted-foreground">
          Your data is private and isolated to your account.
        </p>
      </div>
    </div>
  );
}
