"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatDateForInput } from "@/lib/formatters";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  month: number;
  year: number;
  onSuccess: () => void;
}

export function ExpenseForm({ month, year, onSuccess }: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"FIXED" | "VARIABLE">("VARIABLE");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const d = new Date(year, month - 1, 1);
    setDate(formatDateForInput(d));
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, ""));
    if (Number.isNaN(num) || num < 0 || !categoryId || !date) return;
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: num,
          categoryId,
          date: new Date(date).toISOString(),
          type,
          note: note || undefined,
        }),
      });
      if (res.ok) {
        setAmount("");
        setCategoryId("");
        setNote("");
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Log Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount (KES)</Label>
              <Input
                id="exp-amount"
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                required
              >
                <SelectTrigger id="exp-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end gap-4 pb-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="exp-type" className="text-sm">
                  Variable
                </Label>
                <Switch
                  id="exp-type"
                  checked={type === "FIXED"}
                  onCheckedChange={(checked) =>
                    setType(checked ? "FIXED" : "VARIABLE")
                  }
                />
                <Label className="text-sm">Fixed</Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-note">Note (optional)</Label>
            <Input
              id="exp-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch at office"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
