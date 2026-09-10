"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { request } from "@/lib/api-client";
import slugify from "@/lib/utils/slugify";

const EMPTY = { name: "", slug: "", blurb: "", measurements: "", order: "" };

const CategoryManager = ({ categories, counts, total = categories.length }) => {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);

  const set = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const create = useMutation({
    mutationFn: (payload) => request("/api/admin/categories", { body: payload }),
    onSuccess: (_body, payload) => {
      toast.success(`${payload.name} added`);
      setValues(EMPTY);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: ({ slug, patch }) =>
      request(`/api/admin/categories/${slug}`, { method: "PATCH", body: patch }),
    onSuccess: () => router.refresh(),
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (slug) =>
      request(`/api/admin/categories/${slug}`, { method: "DELETE" }),
    onSuccess: (_body, slug) => {
      toast.success(`${slug} removed`);
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreate = (event) => {
    event.preventDefault();

    create.mutate({
      name: values.name.trim(),
      slug: values.slug.trim() || slugify(values.name),
      blurb: values.blurb.trim(),
      measurements: values.measurements
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      order: values.order === "" ? total : Number(values.order),
      active: true,
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            The types a piece can belong to. Measurements listed here become the
            required fields when adding a piece in that category.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Required measurements</TableHead>
                <TableHead className="text-right">Pieces</TableHead>
                <TableHead className="text-right">Shown</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.slug}>
                  <TableCell className="font-medium">{category.name}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>

                  <TableCell>
                    {category.measurements.length === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {category.measurements.map((label) => (
                          <Badge key={label} variant="neutral">
                            {label}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {counts[category.name] ?? 0}
                  </TableCell>

                  <TableCell className="text-right">
                    <Switch
                      checked={category.active}
                      aria-label={`Show ${category.name} in the shop`}
                      onCheckedChange={(active) =>
                        update.mutate({
                          slug: category.slug,
                          patch: { active },
                        })
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${category.name}`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(category.slug)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a category</CardTitle>
          <CardDescription>
            Separate measurement labels with commas, in the order you want them
            on the intake form.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={values.name}
                onChange={set("name")}
                placeholder="Knitwear"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={values.slug}
                onChange={set("slug")}
                placeholder={values.name ? slugify(values.name) : "knitwear"}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="category-blurb">Blurb</Label>
              <Input
                id="category-blurb"
                value={values.blurb}
                onChange={set("blurb")}
                placeholder="Jumpers and cardigans, measured flat."
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="category-measurements">Required measurements</Label>
              <Input
                id="category-measurements"
                value={values.measurements}
                onChange={set("measurements")}
                placeholder="Pit to pit, Length, Sleeve"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-order">Order</Label>
              <Input
                id="category-order"
                type="number"
                min="0"
                value={values.order}
                onChange={set("order")}
                placeholder={String(total)}
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={create.isPending}>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                {create.isPending ? "Adding…" : "Add category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
