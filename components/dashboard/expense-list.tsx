"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES, formatDate } from "@/lib/formatters";
import { Receipt, ChevronDown, ChevronRight } from "lucide-react";

interface ExpenseItem {
  id: string;
  amount: { toNumber?: () => number };
  date: string;
  type: string;
  note: string | null;
  category: { id: string; name: string };
}

interface ExpenseListProps {
  month: number;
  year: number;
  onUpdate: () => void;
}

function amountNum(e: ExpenseItem): number {
  return typeof e.amount === "object" && e.amount?.toNumber
    ? e.amount.toNumber()
    : Number(e.amount);
}

export function ExpenseList({ month, year }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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

  const grouped = useMemo(() => {
    const byCategory = new Map<
      string,
      { categoryName: string; total: number; expenses: ExpenseItem[] }
    >();
    for (const e of expenses) {
      const key = e.category.id;
      const name = e.category.name;
      const amt = amountNum(e);
      const existing = byCategory.get(key);
      if (existing) {
        existing.total += amt;
        existing.expenses.push(e);
      } else {
        byCategory.set(key, { categoryName: name, total: amt, expenses: [e] });
      }
    }
    Array.from(byCategory.values()).forEach((g) => {
      g.expenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    return Array.from(byCategory.entries())
      .map(([id, g]) => ({ id, ...g }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
          Expenses by category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {grouped.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            No expenses this month. Add one above.
          </p>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => {
              const isCollapsed = collapsed.has(group.id);
              return (
                <div
                  key={group.id}
                  className="rounded-lg border border-border bg-muted/30 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(group.id)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                      {group.categoryName}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatKES(group.total)}
                    </span>
                  </button>
                  {!isCollapsed && (
                    <ul className="divide-y divide-border border-t border-border bg-background/50">
                      {group.expenses.map((e) => (
                        <li
                          key={e.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-muted-foreground">
                              {formatDate(e.date)}
                            </span>
                            {e.type === "FIXED" && (
                              <span className="ml-1.5 text-muted-foreground">
                                · Fixed
                              </span>
                            )}
                            {e.note && (
                              <span className="ml-1.5 text-foreground">
                                · {e.note}
                              </span>
                            )}
                          </div>
                          <span className="font-medium tabular-nums">
                            {formatKES(amountNum(e))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
