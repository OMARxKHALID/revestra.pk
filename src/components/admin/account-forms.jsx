"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { passwordSchema, profileSchema } from "@/lib/schemas/account";
import { request } from "@/lib/api-client";

const Row = ({ control, name, label, description, ...props }) => (
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

const ProfileCard = ({ account }) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: account.name, email: account.email },
    mode: "onBlur",
  });

  const save = useMutation({
    mutationFn: (payload) =>
      request("/api/admin/account", { method: "PATCH", body: payload }),
    onSuccess: () => {
      toast.success("Account updated. Sign in again if you changed your email.");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who you are</CardTitle>
        <CardDescription>
          The name and sign-in address for this back office. Reset codes go to
          this address, so keep it one you can read.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((payload) => save.mutate(payload))}
            className="grid gap-4 sm:max-w-md"
          >
            <Row control={form.control} name="name" label="Name" />
            <Row control={form.control} name="email" label="Email" type="email" />

            <div>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save details"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const PasswordCard = () => {
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
    mode: "onBlur",
  });

  const change = useMutation({
    mutationFn: (payload) =>
      request("/api/admin/account", { method: "PATCH", body: payload }),
    onSuccess: () => {
      toast.success("Password changed");
      form.reset({ current: "", next: "", confirm: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Forgotten it? Sign out and use the reset link on the sign-in page — a
          code is emailed to the address above.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((payload) => change.mutate(payload))}
            className="grid gap-4 sm:max-w-md"
          >
            <Row
              control={form.control}
              name="current"
              label="Current password"
              type="password"
              autoComplete="current-password"
            />
            <Row
              control={form.control}
              name="next"
              label="New password"
              type="password"
              autoComplete="new-password"
            />
            <Row
              control={form.control}
              name="confirm"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
            />

            <div>
              <Button type="submit" disabled={change.isPending}>
                {change.isPending ? "Changing…" : "Change password"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const AccountForms = ({ account }) => (
  <div className="grid gap-6">
    <ProfileCard account={account} />
    <PasswordCard />
  </div>
);

export default AccountForms;
