import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { ExpenseType } from "@prisma/client";

async function getExpenseAndCheckUser(
  id: string,
  userId: string
) {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  return expense;
}

/**
 * PATCH /api/expenses/[id] - Update expense (user-isolated).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getExpenseAndCheckUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    amount?: number;
    categoryId?: string;
    date?: string;
    type?: "FIXED" | "VARIABLE";
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, userId: session.user.id },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(body.amount != null && { amount: body.amount }),
      ...(body.categoryId != null && { categoryId: body.categoryId }),
      ...(body.date != null && { date: new Date(body.date) }),
      ...(body.type != null && ["FIXED", "VARIABLE"].includes(body.type) && {
        type: body.type as ExpenseType,
      }),
      ...(body.note !== undefined && { note: body.note ?? null }),
    },
    include: { category: true },
  });

  return NextResponse.json(expense);
}

/**
 * DELETE /api/expenses/[id] - Delete expense (user-isolated).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getExpenseAndCheckUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
