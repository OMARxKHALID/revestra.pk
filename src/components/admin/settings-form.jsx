"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { SOCIAL_NETWORKS, settingsSchema } from "@/lib/schemas/settings";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/schemas/order";
import { request } from "@/lib/api-client";

const TICKER_ICONS = [
  { value: "globe", label: "Globe" },
  { value: "clock", label: "Clock — live Karachi time when text is left blank" },
  { value: "shield", label: "Shield — accident-free counter when text is blank" },
];

const ToggleField = ({ control, name, label, description }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-4">
        <div>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )}
  />
);

const TextField = ({ control, name, label, description, ...props }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} {...props} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const SettingsForm = ({ settings }) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: "onBlur",
  });

  const { control } = form;
  const enabledMethods = useWatch({ control, name: "enabledMethods" }) ?? [];

  const socials = useFieldArray({ control, name: "socials" });
  const ticker = useFieldArray({ control, name: "ticker" });
  const rates = useFieldArray({
    control,
    name: "commerce.shippingRates",
    keyName: "fieldKey",
  });
  const policies = useFieldArray({ control, name: "policies" });

  const save = useMutation({
    mutationFn: (payload) =>
      request("/api/admin/settings", { method: "PUT", body: payload }),
    onSuccess: () => {
      toast.success("Site settings saved");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSave = (payload) => save.mutate(payload);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>The shop</CardTitle>
            <CardDescription>
              Names and copy used in page titles, search results and link previews.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name" label="Shop name" />
            <TextField control={control} name="legalName" label="Legal name" />
            <TextField
              control={control}
              name="tagline"
              label="Tagline"
              className="sm:col-span-2"
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    Shown to search engines and when a link is shared.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact and address</CardTitle>
            <CardDescription>Everything in the footer’s left column.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="email" label="Contact email" type="email" />
            <TextField
              control={control}
              name="phone"
              label="Phone"
              placeholder="+92 300 1234567"
              description="Left blank, the footer hides it."
            />
            <TextField
              control={control}
              name="whatsapp"
              label="WhatsApp number"
              placeholder="+92 300 1234567"
              description="Shows a Buy on WhatsApp button on every piece. Left blank, the phone number is used."
            />
            <TextField
              control={control}
              name="addressLine"
              label="Street address"
              placeholder="Shop 4, Zamzama Boulevard"
            />
            <TextField control={control} name="city" label="City" />
            <TextField
              control={control}
              name="hours"
              label="Opening hours"
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Shown as icons in the footer. Up to six.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            {socials.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No social links yet.</p>
            )}

            {socials.fields.map((entry, index) => (
              <div
                key={entry.id}
                className="grid gap-3 sm:grid-cols-[160px_1fr_1fr_auto] sm:items-end"
              >
                <FormField
                  control={control}
                  name={`socials.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOCIAL_NETWORKS.map((option) => (
                            <SelectItem key={option} value={option} className="capitalize">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TextField control={control} name={`socials.${index}.label`} label="Label" />
                <TextField
                  control={control}
                  name={`socials.${index}.href`}
                  label="URL"
                  placeholder="https://instagram.com/yourshop"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove social link ${index + 1}`}
                  onClick={() => socials.remove(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </div>
            ))}

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={socials.fields.length >= 6}
                onClick={() =>
                  socials.append({ name: "instagram", label: "", href: "" })
                }
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                Add a link
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marquee</CardTitle>
            <CardDescription>
              The scrolling strip above the footer. Leave the text blank on the clock
              or shield rows to keep their live values.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            {ticker.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No marquee messages — the strip is hidden.
              </p>
            )}

            {ticker.fields.map((entry, index) => (
              <div
                key={entry.id}
                className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end"
              >
                <FormField
                  control={control}
                  name={`ticker.${index}.icon`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TICKER_ICONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TextField control={control} name={`ticker.${index}.text`} label="Message" />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove marquee message ${index + 1}`}
                  onClick={() => ticker.remove(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </div>
            ))}

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={ticker.fields.length >= 6}
                onClick={() => ticker.append({ icon: "globe", text: "" })}
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                Add a message
              </Button>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Pricing and delivery</CardTitle>
            <CardDescription>
              Money is held in paisa, so 25000 is PKR 250. These apply to every
              new order the moment they are saved.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={control}
              name="commerce.freeShippingThresholdCents"
              label="Free shipping over"
              type="number"
              min={0}
              description="Orders at or above this subtotal ship free."
            />

            <TextField
              control={control}
              name="commerce.taxRate"
              label="Tax rate"
              type="number"
              step="0.001"
              min={0}
              max={1}
              description="A fraction, so 0.17 charges 17%."
            />

            <TextField
              control={control}
              name="commerce.holdMinutes"
              label="Stock hold (minutes)"
              type="number"
              min={5}
              max={240}
              description="How long an unpaid order keeps its items reserved."
            />

            <div className="grid gap-4 sm:col-span-2">
              {rates.fields.map((rate, index) => (
                <div
                  key={rate.fieldKey}
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-3"
                >
                  <TextField
                    control={control}
                    name={`commerce.shippingRates.${index}.label`}
                    label={`${rate.id.charAt(0).toUpperCase()}${rate.id.slice(1)} name`}
                  />
                  <TextField
                    control={control}
                    name={`commerce.shippingRates.${index}.note`}
                    label="Delivery promise"
                  />
                  <TextField
                    control={control}
                    name={`commerce.shippingRates.${index}.cents`}
                    label="Price (paisa)"
                    type="number"
                    min={0}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments and accounts</CardTitle>
            <CardDescription>
              Switching a method off hides it at checkout even when its gateway
              keys are configured.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <FormField
              control={control}
              name="enabledMethods"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method}
                      className="flex items-center justify-between gap-4"
                    >
                      <FormLabel className="font-normal">
                        {PAYMENT_METHOD_LABELS[method]}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value?.includes(method) ?? false}
                          onCheckedChange={(on) =>
                            field.onChange(
                              on
                                ? [...(field.value ?? []), method]
                                : (field.value ?? []).filter(
                                    (entry) => entry !== method
                                  )
                            )
                          }
                        />
                      </FormControl>
                    </div>
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {PAYMENT_METHODS.filter((method) =>
              enabledMethods.includes(method)
            ).map((method) => (
              <TextField
                key={method}
                control={control}
                name={`paymentNotes.${method}`}
                label={`${PAYMENT_METHOD_LABELS[method]} note`}
                description="The small line shown under the method at checkout."
              />
            ))}

            <Separator />

            <ToggleField
              control={control}
              name="signupOpen"
              label="Accept new accounts"
              description="Turning this off closes sign-up for everyone."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>
              Shown on /policies and linked from the footer. Payment gateways
              ask to see these before they approve a live merchant account.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {policies.fields.map((policy, index) => (
              <div
                key={policy.id}
                className="grid gap-3 rounded-md border border-border p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <TextField
                    control={control}
                    name={`policies.${index}.title`}
                    label="Title"
                  />

                  <TextField
                    control={control}
                    name={`policies.${index}.slug`}
                    label="Link anchor"
                    description="Lowercase, hyphens only."
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Remove policy ${index + 1}`}
                      onClick={() => policies.remove(index)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </div>
                </div>

                <FormField
                  control={control}
                  name={`policies.${index}.body`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text</FormLabel>
                      <FormControl>
                        <Textarea rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={policies.fields.length >= 8}
                onClick={() =>
                  policies.append({ slug: "", title: "", body: "" })
                }
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                Add a policy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(settings)}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingsForm;
