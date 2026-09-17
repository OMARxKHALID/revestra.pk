"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
import { request } from "@/lib/api-client";

const OrderStatusForm = ({
  reference,
  status: current,
  tracking,
  couriers = [],
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const save = useMutation({
    mutationFn: () =>
      request(`/api/admin/orders/${reference}`, {
        method: "PATCH",
        body: { status, note, courier, trackingNumber },
      }),
    onSuccess: () => {
      toast.success(
        status === current
          ? `Tracking saved for ${reference}`
          : `${reference} is now ${status}`
      );
      setNote("");
      setCourier("");
      setTrackingNumber("");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    save.mutate();
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

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="courier">Courier (optional)</Label>
          <Input
            id="courier"
            list="courier-options"
            value={courier}
            onChange={(event) => setCourier(event.target.value)}
            placeholder={couriers.map(({ name }) => name).join(", ") || "Courier"}
          />
          <datalist id="courier-options">
            {couriers.map(({ name }) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="trackingNumber">Tracking number (optional)</Label>
          <Input
            id="trackingNumber"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Consignment number"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Reason, or anything worth recording"
        />
      </div>

      {(tracking?.courier || tracking?.number) && (
        <p className="text-xs text-muted-foreground">
          Sent to the customer:{" "}
          {[tracking.courier, tracking.number].filter(Boolean).join(" · ")}
          {tracking.url && (
            <>
              {" · "}
              <a
                href={tracking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Track parcel
              </a>
            </>
          )}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          save.isPending || (status === current && !courier && !trackingNumber)
        }
      >
        {save.isPending
          ? "Saving…"
          : status === current
            ? "Save tracking"
            : "Update status"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Cancelling puts every piece on this order back on sale. Shipped,
        delivered and cancelled each email the customer.
      </p>
    </form>
  );
};

export default OrderStatusForm;
