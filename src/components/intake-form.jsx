"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeFormSchema } from "@/lib/schemas/intake-form";
import Field from "@/components/ui/field";
import PillButton from "@/components/ui/pill-button";
import OptionTile from "@/components/ui/option-tile";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import { formatPrice } from "@/lib/utils/price";
import {
  CATEGORIES,
  CONDITIONS,
  MEASUREMENT_TEMPLATES,
  SIZE_SYSTEMS,
} from "@/lib/schemas/product";
import {
  BuildingIcon,
  HashIcon,
  PenIcon,
  PinIcon,
  TagIcon,
} from "@/components/ui/icons";

const SIZE_HINTS = {
  waist: "W32 L30",
  alpha: "M",
  shoe: "UK 9 / EU 43",
  length: '34"',
  "one-size": "One size",
};

const DEFAULT_SYSTEM = {
  Jeans: "waist",
  Pants: "waist",
  Shirts: "alpha",
  Jackets: "alpha",
  Shoes: "shoe",
  Belts: "length",
  Accessories: "one-size",
};

const toRupees = (value) => Math.round(Number(value || 0) * 100);

const IntakeForm = () => {
  const router = useRouter();
  const [category, setCategory] = useState("Jeans");
  const [condition, setCondition] = useState("Good");
  const [sizeSystem, setSizeSystem] = useState("waist");
  const [measurements, setMeasurements] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saved, setSaved] = useState(null);

  const [money, setMoney] = useState({ cost: "", price: "", salePrice: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(intakeFormSchema) });

  const template = MEASUREMENT_TEMPLATES[category] ?? [];
  const price = toRupees(money.price);
  const margin = price - toRupees(money.cost);

  const handleMoney = (key) => (event) =>
    setMoney((current) => ({ ...current, [key]: event.target.value }));

  const handleCategory = (value) => {
    setCategory(value);
    setSizeSystem(DEFAULT_SYSTEM[value] ?? "one-size");
    setMeasurements({});
  };

  const handleMeasurement = (label) => (event) =>
    setMeasurements((current) => ({ ...current, [label]: event.target.value }));

  const onSubmit = async (values) => {
    setSubmitError(null);
    setSaved(null);

    const missing = template.filter((label) => !measurements[label]?.trim());

    if (missing.length) {
      setSubmitError(`Still need ${missing.join(", ")}`);
      return;
    }

    if (toRupees(money.cost) <= 0 || toRupees(money.price) <= 0) {
      setSubmitError("Enter what you paid and what you are asking");
      return;
    }

    const body = {
      name: values.name,
      brand: values.brand,
      tagline: values.tagline,
      category,
      condition,
      conditionNotes: values.conditionNotes || null,
      sizeSystem,
      sizeLabel: values.sizeLabel,
      measurements,
      priceCents: toRupees(money.price),
      salePriceCents: money.salePrice ? toRupees(money.salePrice) : null,
      costCents: toRupees(money.cost),
      lot: values.lot || null,
      image: values.image,
      images: [],
      description: values.description,
      details: values.details
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      status: "available",
      reservedUntil: null,
      soldAt: null,
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(result.error ?? "Could not save that piece.");
        return;
      }

      setSaved(result.product);
      reset();
      setMeasurements({});
      setMoney({ cost: "", price: "", salePrice: "" });
      router.refresh();
    } catch {
      setSubmitError("Network error. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-12">
      <h2 className={cn(META, "border-b border-black/10 pb-4 text-black/70")}>
        What is it
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((option) => (
          <OptionTile
            key={option}
            label={option}
            selected={category === option}
            onClick={() => handleCategory(option)}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          id="brand"
          label="Brand"
          icon={<TagIcon className="h-4 w-4" />}
          placeholder="Levi's, Carhartt, Unbranded"
          registration={register("brand")}
          error={errors.brand?.message}
        />
        <Field
          id="name"
          label="Name"
          icon={<PenIcon className="h-4 w-4" />}
          placeholder="501 Straight"
          registration={register("name")}
          error={errors.name?.message}
        />
        <Field
          id="sizeLabel"
          label={`Size (${sizeSystem})`}
          icon={<HashIcon className="h-4 w-4" />}
          placeholder={SIZE_HINTS[sizeSystem]}
          registration={register("sizeLabel")}
          error={errors.sizeLabel?.message}
        />
        <Field
          id="tagline"
          label="One-line hook"
          icon={<PenIcon className="h-4 w-4" />}
          placeholder="Honest fade, no stretch"
          registration={register("tagline")}
          error={errors.tagline?.message}
        />
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {SIZE_SYSTEMS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={sizeSystem === option}
            onClick={() => setSizeSystem(option)}
            className={cn(
              META,
              "rounded-full border px-3 py-1.5 transition",
              sizeSystem === option
                ? "border-blurple bg-blurple text-white"
                : "border-black/20 text-black/70 hover:border-black/60"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <h2
        className={cn(META, "mt-12 border-b border-black/10 pb-4 text-black/70")}
      >
        Measurements, laid flat
      </h2>

      {template.length === 0 ? (
        <p className={cn(NOTICE, "mt-6 text-black/45")}>
          No measurements required for {category}.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2">
          {template.map((label) => (
            <Field
              key={label}
              id={`m-${label}`}
              label={label}
              icon={<PinIcon className="h-4 w-4" />}
              placeholder={'32"'}
              value={measurements[label] ?? ""}
              onChange={handleMeasurement(label)}
            />
          ))}
        </div>
      )}

      <h2
        className={cn(META, "mt-12 border-b border-black/10 pb-4 text-black/70")}
      >
        Condition
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CONDITIONS.map((option) => (
          <OptionTile
            key={option}
            label={option}
            selected={condition === option}
            onClick={() => setCondition(option)}
          />
        ))}
      </div>

      <div className="mt-7">
        <Field
          id="conditionNotes"
          label="Flaws, honestly (optional)"
          icon={<PenIcon className="h-4 w-4" />}
          placeholder="Small paint fleck on left cuff, pictured"
          registration={register("conditionNotes")}
          error={errors.conditionNotes?.message}
        />
      </div>

      <h2
        className={cn(META, "mt-12 border-b border-black/10 pb-4 text-black/70")}
      >
        Money
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-3">
        <Field
          id="cost"
          label="What you paid (Rs)"
          type="number"
          step="1"
          icon={<TagIcon className="h-4 w-4" />}
          value={money.cost}
          onChange={handleMoney("cost")}
        />
        <Field
          id="price"
          label="List price (Rs)"
          type="number"
          step="1"
          icon={<TagIcon className="h-4 w-4" />}
          value={money.price}
          onChange={handleMoney("price")}
        />
        <Field
          id="salePrice"
          label="Sale price (Rs, optional)"
          type="number"
          step="1"
          icon={<TagIcon className="h-4 w-4" />}
          value={money.salePrice}
          onChange={handleMoney("salePrice")}
        />
      </div>

      <p className={cn(META, "mt-4", margin > 0 ? "text-blurple" : "text-sale")}>
        Margin {formatPrice(margin)}
        {price > 0 ? ` · ${Math.round((margin / price) * 100)}%` : ""}
      </p>

      <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          id="lot"
          label="Lot / bale (optional)"
          icon={<BuildingIcon className="h-4 w-4" />}
          placeholder="BALE-04"
          registration={register("lot")}
          error={errors.lot?.message}
        />
        <Field
          id="image"
          label="Photo path"
          icon={<PinIcon className="h-4 w-4" />}
          placeholder="/assets/WEBP/your-photo.webp"
          registration={register("image")}
          error={errors.image?.message}
        />
      </div>

      <h2
        className={cn(META, "mt-12 border-b border-black/10 pb-4 text-black/70")}
      >
        Copy
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-7">
        <Field
          id="description"
          label="Description"
          icon={<PenIcon className="h-4 w-4" />}
          registration={register("description")}
          error={errors.description?.message}
        />
        <Field
          id="details"
          label="Details, one per line"
          icon={<PenIcon className="h-4 w-4" />}
          placeholder="100% cotton denim"
          registration={register("details")}
          error={errors.details?.message}
        />
      </div>

      <PillButton type="submit" disabled={isSubmitting} className="mt-10">
        {isSubmitting ? "Saving…" : "List this piece"}
      </PillButton>

      <p
        aria-live="polite"
        className={cn(NOTICE, "mt-4", submitError ? "text-sale" : "text-blurple")}
      >
        {submitError ?? (saved ? `${saved.sku} listed at ${saved.slug}` : " ")}
      </p>
    </form>
  );
};

export default IntakeForm;
