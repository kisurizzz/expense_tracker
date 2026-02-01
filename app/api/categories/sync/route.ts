import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

const DEFAULT_CATEGORIES = [
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

/**
 * POST /api/categories/sync
 * Adds any default categories the user doesn't have yet (for existing accounts).
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.category.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.name));
  if (toCreate.length === 0) {
    return NextResponse.json({ added: 0, message: "All default categories already exist." });
  }

  await prisma.category.createMany({
    data: toCreate.map((c) => ({
      userId: session.user.id!,
      name: c.name,
      sortOrder: c.sortOrder,
      isDefault: true,
    })),
  });

  return NextResponse.json({ added: toCreate.length, categories: toCreate.map((c) => c.name) });
}
