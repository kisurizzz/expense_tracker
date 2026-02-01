import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { ExpenseType } from "@prisma/client";

/**
 * GET /api/expenses
 * Returns expenses for the logged-in user only.
 * Query: ?month=1&year=2025 (optional filter)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: { userId: string; date?: { gte: Date; lte: Date } } = {
    userId: session.user.id,
  };

  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!Number.isNaN(m) && !Number.isNaN(y)) {
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

/**
 * POST /api/expenses
 * Create expense for the logged-in user only. Body: amount, categoryId, date, type, note?
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    amount: number;
    categoryId: string;
    date: string;
    type: "FIXED" | "VARIABLE";
    note?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, categoryId, date, type, note } = body;
  if (
    typeof amount !== "number" ||
    amount < 0 ||
    !categoryId ||
    !date ||
    !type ||
    !["FIXED", "VARIABLE"].includes(type)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid: amount, categoryId, date, type" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      amount,
      categoryId,
      date: new Date(date),
      type: type as ExpenseType,
      note: note ?? null,
    },
    include: { category: true },
  });

  return NextResponse.json(expense);
}
