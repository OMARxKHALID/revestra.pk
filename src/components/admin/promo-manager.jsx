"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/price";

const KINDS = [
  { value: "percent", label: "Percent off" },
  { value: "fixed", label: "Fixed amount off" },
  { value: "free_shipping", label: "Free shipping" },
];

const EMPTY = {
  code: "",
  kind: "percent",
  value: "10",
  minSubtotalCents: "0",
  active: true,
  maxRedemptions: "",
};

const describe = (promo) => {
  if (promo.kind === "percent") return `${promo.value}% off`;
  if (promo.kind === "fixed") return `${formatPrice(promo.value)} off`;

  return "Free shipping";
};

const PromoManager = ({ promos }) => {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleField = (key) => (event) => set(key)(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      code: values.code.trim().toUpperCase(),
      kind: values.kind,
      value:
        values.kind === "fixed"
          ? Math.round(Number(values.value) * 100)
          : Number(values.value),
      minSubtotalCents: Math.round(Number(values.minSubtotalCents || 0) * 100),
      active: values.active,
      maxRedemptions: values.maxRedemptions
        ? Number(values.maxRedemptions)
        : null,
      startsAt: null,
      endsAt: null,
    };

    try {
      const response = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body.error ?? "Could not save that code");
        return;
      }

      toast.success(`${payload.code} saved`);
      setValues(EMPTY);
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    const response = await fetch(`/api/admin/promos/${code}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("Could not delete that code");
      return;
    }

    toast.success(`${code} deleted`);
    router.refresh();
  };

  return (
    <div className="grid gap-6">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="grid gap-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={values.code}
            onChange={handleField("code")}
            placeholder="WELCOME10"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="kind">Kind</Label>
          <Select
          items={Object.fromEntries(
            KINDS.map((kind) => [kind.value, kind.label])
          )}
          value={values.kind}
          onValueChange={set("kind")}
        >
            <SelectTrigger id="kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map((kind) => (
                <SelectItem key={kind.value} value={kind.value}>
                  {kind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="value">
            {values.kind === "percent" ? "Percent" : "Amount (Rs)"}
          </Label>
          <Input
            id="value"
            type="number"
            min="0"
            value={values.value}
            onChange={handleField("value")}
            disabled={values.kind === "free_shipping"}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="minSubtotalCents">Minimum cart (Rs)</Label>
          <Input
            id="minSubtotalCents"
            type="number"
            min="0"
            value={values.minSubtotalCents}
            onChange={handleField("minSubtotalCents")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxRedemptions">Max redemptions</Label>
          <Input
            id="maxRedemptions"
            type="number"
            min="1"
            value={values.maxRedemptions}
            onChange={handleField("maxRedemptions")}
            placeholder="Unlimited"
          />
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-start">
          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={values.active}
              onCheckedChange={set("active")}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save code"}
          </Button>
        </div>
      </form>

      <Separator />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="hidden sm:table-cell">Minimum</TableHead>
              <TableHead className="hidden md:table-cell">Redeemed</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="w-[64px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {promos.map((promo) => (
              <TableRow key={promo.code}>
                <TableCell className="font-medium">{promo.code}</TableCell>
                <TableCell>{describe(promo)}</TableCell>
                <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">
                  {promo.minSubtotalCents
                    ? formatPrice(promo.minSubtotalCents)
                    : "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell tabular-nums text-muted-foreground">
                  {promo.redemptions ?? 0}
                  {promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={promo.active ? "secondary" : "outline"}>
                    {promo.active ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${promo.code}`}
                    onClick={() => handleDelete(promo.code)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {promos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No promo codes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PromoManager;
