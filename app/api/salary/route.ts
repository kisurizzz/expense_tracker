import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

/**
 * GET /api/salary
 * Returns salary for the logged-in user. Query: ?month=1&year=2025
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

  const salary = await prisma.salary.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: m,
        year: y,
      },
    },
  });

  return NextResponse.json(salary ?? null);
}

/**
 * PUT /api/salary
 * Set monthly net salary for the logged-in user. Body: month, year, amount
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { month: number; year: number; amount: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { month, year, amount } = body;
  if (
    typeof month !== "number" ||
    typeof year !== "number" ||
    typeof amount !== "number" ||
    amount < 0 ||
    month < 1 ||
    month > 12
  ) {
    return NextResponse.json(
      { error: "Invalid month, year, or amount" },
      { status: 400 }
    );
  }

  const salary = await prisma.salary.upsert({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month,
        year,
      },
    },
    create: {
      userId: session.user.id,
      month,
      year,
      amount,
    },
    update: { amount },
  });

  return NextResponse.json(salary);
}
