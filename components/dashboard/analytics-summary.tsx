"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES } from "@/lib/formatters";
import { getShortMonthName } from "@/lib/formatters";
import { Wallet, PiggyBank } from "lucide-react";

interface Analytics {
  month: number;
  year: number;
  salary: number;
  totalExpenses: number;
  remaining: number;
  savingsAmount: number;
  savingsRate: number;
}

interface AnalyticsSummaryProps {
  month: number;
  year: number;
}

export function AnalyticsSummary({ month, year }: AnalyticsSummaryProps) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/analytics?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading summary…
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Could not load analytics.
        </CardContent>
      </Card>
    );
  }

  const label = `${getShortMonthName(month)} ${year}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salary</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatKES(data.salary)}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatKES(data.totalExpenses)}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              data.remaining >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatKES(data.remaining)}
          </p>
          <p className="text-xs text-muted-foreground">
            Salary − Expenses
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.savingsRate}%</p>
          <p className="text-xs text-muted-foreground">
            Savings ÷ Salary × 100
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
