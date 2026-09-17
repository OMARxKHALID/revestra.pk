"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REFUND_METHODS } from "@/lib/schemas/admin";
import { formatPrice } from "@/lib/utils/price";
import { request } from "@/lib/api-client";

const EMPTY = { amount: "", method: "original", reference: "", note: "" };

const RefundsCard = ({ reference, totalCents, refunds = [], refundedCents = 0 }) => {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const remainingCents = Math.max(0, totalCents - refundedCents);

  const handleField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const save = useMutation({
    mutationFn: () =>
      request(`/api/admin/orders/${reference}/refunds`, { body: values }),
    onSuccess: () => {
      toast.success("Refund recorded");
      setValues(EMPTY);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
        <CardDescription>
          {refundedCents > 0
            ? `${formatPrice(refundedCents)} refunded of ${formatPrice(totalCents)}.`
            : "Record money returned to the customer. Nothing is sent to a gateway."}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {refunds.length > 0 && (
          <ul className="grid gap-2 text-sm">
            {refunds.map((refund, index) => (
              <li
                key={`${refund.at}-${index}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2 last:border-0"
              >
                <span className="tabular-nums font-medium">
                  {formatPrice(refund.amountCents)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {REFUND_METHODS[refund.method] ?? refund.method}
                  {refund.reference ? ` · ${refund.reference}` : ""}
                  {" · "}
                  {new Date(refund.at).toLocaleDateString("en-PK")}
                  {refund.note ? ` · ${refund.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        {remainingCents > 0 && (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="refund-amount">Amount (PKR)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  min="1"
                  step="1"
                  max={remainingCents / 100}
                  value={values.amount}
                  onChange={handleField("amount")}
                  placeholder={String(remainingCents / 100)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="refund-method">Paid back by</Label>
                <Select
                  value={values.method}
                  onValueChange={(method) =>
                    setValues((current) => ({ ...current, method }))
                  }
                  items={REFUND_METHODS}
                >
                  <SelectTrigger id="refund-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REFUND_METHODS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refund-reference">Transaction reference (optional)</Label>
              <Input
                id="refund-reference"
                value={values.reference}
                onChange={handleField("reference")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refund-note">Note (optional)</Label>
              <Input
                id="refund-note"
                value={values.note}
                onChange={handleField("note")}
                placeholder="Returned item, wrong size"
              />
            </div>

            <Button type="submit" disabled={save.isPending || !values.amount}>
              {save.isPending ? "Saving…" : "Record refund"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default RefundsCard;
