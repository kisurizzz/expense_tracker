import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

/**
 * GET /api/analytics
 * Monthly summary for logged-in user. Query: ?month=1&year=2025
 * Returns: salary, totalExpenses, remaining, savingsRate (Savings category / Salary * 100)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const y = year ? parseInt(year, 10) : new Date().getFullYear();

  const startOfMonth = new Date(y, m - 1, 1);
  const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

  const [salaryRecord, expenseAgg, savingsCategory] = await Promise.all([
    prisma.salary.findUnique({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month: m,
          year: y,
        },
      },
    }),
    prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: { contains: "Savings", mode: "insensitive" },
      },
    }),
  ]);

  const salary = salaryRecord ? Number(salaryRecord.amount) : 0;
  const totalExpenses = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;
  const remaining = salary - totalExpenses;

  let savingsAmount = 0;
  if (savingsCategory) {
    const savingsAgg = await prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        categoryId: savingsCategory.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });
    savingsAmount = savingsAgg._sum.amount ? Number(savingsAgg._sum.amount) : 0;
  }

  const savingsRate =
    salary > 0 ? Math.round((savingsAmount / salary) * 10000) / 100 : 0;

  return NextResponse.json({
    month: m,
    year: y,
    salary,
    totalExpenses,
    remaining,
    savingsAmount,
    savingsRate,
  });
}
