"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKES } from "@/lib/formatters";
import { Pencil } from "lucide-react";

interface SalaryCardProps {
  month: number;
  year: number;
  onUpdate: () => void;
}

export function SalaryCard({ month, year, onUpdate }: SalaryCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/salary?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setSavedAmount(data?.amount != null ? Number(data.amount) : null);
          setAmount(
            data?.amount != null ? String(Number(data.amount)) : ""
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const handleSave = async () => {
    const num = parseFloat(amount.replace(/,/g, ""));
    if (Number.isNaN(num) || num < 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/salary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, amount: num }),
      });
      if (res.ok) {
        setSavedAmount(num);
        setEditing(false);
        onUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Loading salary…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Monthly Net Salary</CardTitle>
        {!editing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label="Edit salary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary-amount">Amount (KES)</Label>
              <Input
                id="salary-amount"
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 85000"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setAmount(
                    savedAmount != null ? String(savedAmount) : ""
                  );
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-semibold">
            {savedAmount != null ? formatKES(savedAmount) : "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
