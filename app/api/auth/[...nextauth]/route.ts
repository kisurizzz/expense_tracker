import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error(
    "[NextAuth] Google OAuth is missing env vars. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file (in the project root, not .env.example). Restart the dev server after changing .env."
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  events: {
    createUser: async ({ user }) => {
      // Seed default categories for new user
      const defaults = [
        { name: "Food/Lunch", sortOrder: 1 },
        { name: "Transport", sortOrder: 2 },
        { name: "Personal Effects", sortOrder: 3 },
        { name: "Savings/MMF (Etica)", sortOrder: 4 },
        { name: "Rent", sortOrder: 5 },
        { name: "Utilities", sortOrder: 6 },
        { name: "Airtime", sortOrder: 7 },
        { name: "Data Bundles", sortOrder: 8 },
        { name: "Grooming", sortOrder: 9 },
        { name: "New Clothes", sortOrder: 10 },
        { name: "Snacks/Sweets", sortOrder: 11 },
        { name: "Debts", sortOrder: 12 },
        { name: "Enjoyment/Bash", sortOrder: 13 },
        { name: "Takeouts", sortOrder: 14 },
        { name: "Dates", sortOrder: 15 },
        { name: "Big Boy/Girl Purchases", sortOrder: 16 },
      ];
      await prisma.category.createMany({
        data: defaults.map((c) => ({
          userId: user.id!,
          name: c.name,
          sortOrder: c.sortOrder,
          isDefault: true,
        })),
      });
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
