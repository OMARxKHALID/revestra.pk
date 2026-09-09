"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AVAILABILITY,
  CATEGORIES,
  CONDITIONS,
  MEASUREMENT_TEMPLATES,
  SIZE_SYSTEMS,
} from "@/lib/schemas/product";

const toRupees = (cents) => (cents === null || cents === undefined ? "" : String(cents / 100));

const toCents = (rupees) =>
  rupees === "" || rupees === null ? null : Math.round(Number(rupees) * 100);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const blank = (sku) => ({
  sku: sku ?? "",
  slug: "",
  name: "",
  tagline: "",
  brand: "",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "",
  condition: "Good",
  conditionNotes: "",
  priceCents: "",
  salePriceCents: "",
  costCents: "",
  lot: "",
  image: "",
  images: "",
  description: "",
  details: "",
  status: "available",
  measurements: {},
});

const fromProduct = (product) => ({
  ...product,
  conditionNotes: product.conditionNotes ?? "",
  lot: product.lot ?? "",
  priceCents: toRupees(product.priceCents),
  salePriceCents: toRupees(product.salePriceCents),
  costCents: toRupees(product.costCents ?? 0),
  images: (product.images ?? []).join("\n"),
  details: (product.details ?? []).join("\n"),
  measurements: product.measurements ?? {},
});

const Row = ({ children, className = "" }) => (
  <div className={`grid gap-2 ${className}`}>{children}</div>
);

const ProductForm = ({ product, suggestedSku }) => {
  const router = useRouter();
  const editing = Boolean(product);
  const [values, setValues] = useState(
    editing ? fromProduct(product) : blank(suggestedSku)
  );
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleField = (key) => (event) => set(key)(event.target.value);

  const handleName = (event) => {
    const name = event.target.value;

    setValues((current) => ({
      ...current,
      name,
      slug: editing || current.slug ? current.slug : slugify(name),
    }));
  };

  const handleMeasurement = (label) => (event) =>
    setValues((current) => ({
      ...current,
      measurements: { ...current.measurements, [label]: event.target.value },
    }));

  const labels = MEASUREMENT_TEMPLATES[values.category] ?? [];

  const payload = () => ({
    sku: values.sku.trim(),
    slug: values.slug.trim(),
    name: values.name.trim(),
    tagline: values.tagline.trim(),
    brand: values.brand.trim(),
    category: values.category,
    sizeSystem: values.sizeSystem,
    sizeLabel: values.sizeLabel.trim(),
    measurements: Object.fromEntries(
      Object.entries(values.measurements).filter(([, value]) => value !== "")
    ),
    condition: values.condition,
    conditionNotes: values.conditionNotes.trim() || null,
    priceCents: toCents(values.priceCents) ?? 0,
    salePriceCents: toCents(values.salePriceCents),
    costCents: toCents(values.costCents) ?? 0,
    lot: values.lot.trim() || null,
    image: values.image.trim(),
    images: values.images
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    description: values.description.trim(),
    details: values.details
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    status: values.status,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const url = editing
      ? `/api/admin/products/${product.slug}`
      : "/api/admin/products";

    try {
      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body.error ?? "Could not save the piece");
        return;
      }

      toast.success(editing ? "Saved" : "Added to the catalogue");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={values.sku} onChange={handleField("sku")} required />
        </Row>

        <Row>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={handleField("slug")}
            disabled={editing}
            required
          />
        </Row>

        <Row>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={values.name} onChange={handleName} required />
        </Row>

        <Row>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" value={values.brand} onChange={handleField("brand")} required />
        </Row>

        <Row className="sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={values.tagline}
            onChange={handleField("tagline")}
            placeholder="Honest fade, no stretch"
            required
          />
        </Row>

        <Row>
          <Label htmlFor="category">Category</Label>
          <Select value={values.category} onValueChange={set("category")}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row>
          <Label htmlFor="condition">Condition</Label>
          <Select value={values.condition} onValueChange={set("condition")}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row>
          <Label htmlFor="sizeSystem">Size system</Label>
          <Select value={values.sizeSystem} onValueChange={set("sizeSystem")}>
            <SelectTrigger id="sizeSystem">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZE_SYSTEMS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row>
          <Label htmlFor="sizeLabel">Size label</Label>
          <Input
            id="sizeLabel"
            value={values.sizeLabel}
            onChange={handleField("sizeLabel")}
            placeholder="W32 L30"
            required
          />
        </Row>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Row>
          <Label htmlFor="priceCents">List price (Rs)</Label>
          <Input
            id="priceCents"
            type="number"
            min="0"
            step="1"
            value={values.priceCents}
            onChange={handleField("priceCents")}
            required
          />
        </Row>

        <Row>
          <Label htmlFor="salePriceCents">Sale price (Rs)</Label>
          <Input
            id="salePriceCents"
            type="number"
            min="0"
            step="1"
            value={values.salePriceCents}
            onChange={handleField("salePriceCents")}
            placeholder="Leave empty for none"
          />
        </Row>

        <Row>
          <Label htmlFor="costCents">Cost (Rs)</Label>
          <Input
            id="costCents"
            type="number"
            min="0"
            step="1"
            value={values.costCents}
            onChange={handleField("costCents")}
            required
          />
        </Row>

        <Row>
          <Label htmlFor="lot">Lot</Label>
          <Input
            id="lot"
            value={values.lot}
            onChange={handleField("lot")}
            placeholder="BALE-04"
          />
        </Row>

        <Row>
          <Label htmlFor="status">Availability</Label>
          <Select value={values.status} onValueChange={set("status")}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </div>

      {labels.length > 0 && (
        <>
          <Separator />

          <div className="grid gap-4">
            <p className="text-sm font-medium">Measurements, laid flat</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {labels.map((label) => (
                <Row key={label}>
                  <Label htmlFor={`m-${label}`}>{label}</Label>
                  <Input
                    id={`m-${label}`}
                    value={values.measurements[label] ?? ""}
                    onChange={handleMeasurement(label)}
                    placeholder='32"'
                    required
                  />
                </Row>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="grid gap-4">
        <Row>
          <Label htmlFor="image">Main image path</Label>
          <Input
            id="image"
            value={values.image}
            onChange={handleField("image")}
            placeholder="/assets/WEBP/name.webp"
            required
          />
        </Row>

        <Row>
          <Label htmlFor="images">More images, one path per line</Label>
          <Textarea
            id="images"
            rows={3}
            value={values.images}
            onChange={handleField("images")}
          />
        </Row>

        <Row>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={values.description}
            onChange={handleField("description")}
            required
          />
        </Row>

        <Row>
          <Label htmlFor="conditionNotes">Condition notes</Label>
          <Textarea
            id="conditionNotes"
            rows={2}
            value={values.conditionNotes}
            onChange={handleField("conditionNotes")}
          />
        </Row>

        <Row>
          <Label htmlFor="details">Details, one line each</Label>
          <Textarea
            id="details"
            rows={4}
            value={values.details}
            onChange={handleField("details")}
            required
          />
        </Row>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add the piece"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
