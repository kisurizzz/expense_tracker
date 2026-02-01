"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES, formatDate } from "@/lib/formatters";
import { Receipt } from "lucide-react";

interface ExpenseItem {
  id: string;
  amount: { toNumber?: () => number };
  date: string;
  type: string;
  note: string | null;
  category: { name: string };
}

interface ExpenseListProps {
  month: number;
  year: number;
  onUpdate: () => void;
}

export function ExpenseList({ month, year, onUpdate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/expenses?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setExpenses(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setExpenses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const amountNum = (e: ExpenseItem) =>
    typeof e.amount === "object" && e.amount?.toNumber
      ? e.amount.toNumber()
      : Number(e.amount);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading expenses…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5" />
          Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            No expenses this month. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {e.category.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(e.date)}
                    {e.type === "FIXED" && " · Fixed"}
                    {e.note && ` · ${e.note}`}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">
                  {formatKES(amountNum(e))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
