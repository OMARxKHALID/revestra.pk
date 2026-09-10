"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABILITY, CONDITIONS, SIZE_SYSTEMS } from "@/lib/schemas/product";
import { makeAdminProductFormSchema } from "@/lib/schemas/admin";
import { request } from "@/lib/api-client";
import ImageUploader from "@/components/admin/image-uploader";
import slugify from "@/lib/utils/slugify";

const toRupees = (cents) =>
  cents === null || cents === undefined ? "" : String(cents / 100);

const blank = (sku, category = "") => ({
  sku: sku ?? "",
  slug: "",
  name: "",
  tagline: "",
  brand: "",
  category,
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
  ...blank(product.sku),
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

const SelectField = ({ control, name, label, options, capitalize = false }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select value={field.value} onValueChange={field.onChange}>
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className={capitalize ? "capitalize" : undefined}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

const TextField = ({ control, name, label, className, ...props }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} {...props} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const AreaField = ({ control, name, label, rows }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Textarea rows={rows} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const ProductForm = ({
  product,
  suggestedSku,
  categories = [],
  existingImages = [],
}) => {
  const router = useRouter();
  const editing = Boolean(product);

  const templates = Object.fromEntries(
    categories.map(({ name, measurements }) => [name, measurements])
  );

  const names = categories.map(({ name }) => name);

  const form = useForm({
    resolver: zodResolver(makeAdminProductFormSchema(templates)),
    defaultValues: editing
      ? fromProduct(product)
      : blank(suggestedSku, names[0] ?? ""),
    mode: "onBlur",
  });

  const { control, setValue, getValues, formState } = form;

  const pictures = [
    useWatch({ control, name: "image" }),
    ...useWatch({ control, name: "images" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ].filter(Boolean);

  const handlePictures = (next) => {
    setValue("image", next[0] ?? "", { shouldValidate: true });
    setValue("images", next.slice(1).join("\n"), { shouldValidate: true });
  };
  const category = useWatch({ control, name: "category" });
  const labels = templates[category] ?? [];

  const save = useMutation({
    mutationFn: (payload) =>
      request(
        editing ? `/api/admin/products/${product.slug}` : "/api/admin/products",
        { method: editing ? "PATCH" : "POST", body: payload }
      ),
    onSuccess: () => {
      toast.success(editing ? "Saved" : "Added to the catalogue");
      router.push("/admin/products");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleName = (event) => {
    const { value } = event.target;

    setValue("name", value, { shouldValidate: true });

    if (!editing && !getValues("slug"))
      setValue("slug", slugify(value), { shouldValidate: true });
  };

  const handleCancel = () => router.push("/admin/products");
  const handleSave = (payload) => save.mutate(payload);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={control} name="sku" label="SKU" />
          <TextField
            control={control}
            name="slug"
            label="Slug"
            disabled={editing}
          />

          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} onChange={handleName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TextField control={control} name="brand" label="Brand" />
          <TextField
            control={control}
            name="tagline"
            label="Tagline"
            className="sm:col-span-2"
            placeholder="Honest fade, no stretch"
          />

          <SelectField
            control={control}
            name="category"
            label="Category"
            options={names}
          />
          <SelectField
            control={control}
            name="condition"
            label="Condition"
            options={CONDITIONS}
          />
          <SelectField
            control={control}
            name="sizeSystem"
            label="Size system"
            options={SIZE_SYSTEMS}
          />
          <TextField
            control={control}
            name="sizeLabel"
            label="Size label"
            placeholder="W32 L30"
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField
            control={control}
            name="priceCents"
            label="List price (Rs)"
            type="number"
            min="0"
            step="1"
          />
          <TextField
            control={control}
            name="salePriceCents"
            label="Sale price (Rs)"
            type="number"
            min="0"
            step="1"
            placeholder="Leave empty for none"
          />
          <TextField
            control={control}
            name="costCents"
            label="Cost (Rs)"
            type="number"
            min="0"
            step="1"
          />
          <TextField
            control={control}
            name="lot"
            label="Lot"
            placeholder="BALE-04"
          />
          <SelectField
            control={control}
            name="status"
            label="Availability"
            options={AVAILABILITY}
            capitalize
          />
        </div>

        {labels.length > 0 && (
          <>
            <Separator />

            <div className="grid gap-4">
              <p className="text-sm font-medium">Measurements, laid flat</p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {labels.map((label) => (
                  <TextField
                    key={label}
                    control={control}
                    name={`measurements.${label}`}
                    label={label}
                    placeholder='32"'
                  />
                ))}
              </div>

              <FormField
                control={control}
                name="measurements"
                render={() => <FormMessage />}
              />
            </div>
          </>
        )}

        <Separator />

        <div className="grid gap-4">
          <FormField
            control={control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Pictures</FormLabel>
                <FormControl>
                  <ImageUploader
                    value={pictures}
                    existing={existingImages}
                    onChange={handlePictures}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <AreaField
            control={control}
            name="description"
            label="Description"
            rows={4}
          />
          <AreaField
            control={control}
            name="conditionNotes"
            label="Condition notes"
            rows={2}
          />
          <AreaField
            control={control}
            name="details"
            label="Details, one line each"
            rows={4}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Add the piece"}
          </Button>

          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          {!formState.isValid && formState.isSubmitted && (
            <p role="alert" className="self-center text-sm text-destructive">
              Fix the highlighted fields before saving.
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
