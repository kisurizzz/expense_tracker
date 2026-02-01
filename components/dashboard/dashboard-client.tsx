"use client";

import { useState } from "react";
import { AnalyticsSummary } from "./analytics-summary";
import { SalaryCard } from "./salary-card";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { getMonthName } from "@/lib/formatters";

const currentDate = new Date();
const defaultMonth = currentDate.getMonth() + 1;
const defaultYear = currentDate.getFullYear();

export function DashboardClient() {
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [key, setKey] = useState(0);

  const refresh = () => setKey((k) => k + 1);

  const years: number[] = [];
  for (let y = defaultYear - 2; y <= defaultYear + 1; y++) years.push(y);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Expense Tracker
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </header>

        <AnalyticsSummary key={`analytics-${key}`} month={month} year={year} />

        <SalaryCard
          key={`salary-${key}`}
          month={month}
          year={year}
          onUpdate={refresh}
        />

        <ExpenseForm
          month={month}
          year={year}
          onSuccess={refresh}
        />

        <ExpenseList
          key={`expenses-${key}`}
          month={month}
          year={year}
          onUpdate={refresh}
        />
      </div>
    </div>
  );
}
