"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { SETTABLE_ORDER_STATUSES } from "@/lib/schemas/admin";

const OrderStatusForm = ({ reference, status: current }) => {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body.error ?? "Could not update the order");
        return;
      }

      toast.success(`${reference} is now ${status}`);
      setNote("");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="status">Move to</Label>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {SETTABLE_ORDER_STATUSES.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tracking number, courier, reason"
        />
      </div>

      <Button type="submit" disabled={saving || status === current}>
        {saving ? "Saving…" : "Update status"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Cancelling puts every piece on this order back on sale.
      </p>
    </form>
  );
};

export default OrderStatusForm;
