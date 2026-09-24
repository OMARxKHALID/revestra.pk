"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "@/components/ui/field";
import PillButton from "@/components/ui/pill-button";
import ErrorNotice from "@/components/ui/error-notice";
import { LockIcon, MailIcon, HashIcon } from "@/components/ui/icons";
import cn from "@/lib/utils/cn";
import { BODY, NOTICE } from "@/lib/type";
import { resetConfirmSchema, resetRequestSchema } from "@/lib/schemas/account";
import { request } from "@/lib/api-client";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [sentTo, setSentTo] = useState(null);

  const requestForm = useForm({ resolver: zodResolver(resetRequestSchema) });

  const confirmForm = useForm({
    resolver: zodResolver(resetConfirmSchema),
    defaultValues: { email: "", code: "", password: "", confirm: "" },
  });

  const ask = useMutation({
    mutationFn: (email) =>
      request("/api/account/reset/request", { body: { email } }),
    onSuccess: (body, email) => {
      setSentTo(email);
      confirmForm.setValue("email", email);
    },
  });

  const confirm = useMutation({
    mutationFn: (payload) =>
      request("/api/account/reset/confirm", { body: payload }),
    onSuccess: () => router.push("/sign-in?reset=1"),
  });

  if (!sentTo)
    return (
      <form
        onSubmit={requestForm.handleSubmit(({ email }) => ask.mutate(email))}
        noValidate
        className="mt-10"
      >
        <p className={cn(BODY, "mb-8 text-ink-muted")}>
          Enter the address you sign in with. If it has an account, we email a
          six-digit code that works once and expires in fifteen minutes.
        </p>

        <Field
          id="reset-email"
          label="Email"
          type="email"
          autoComplete="email"
          icon={<MailIcon className="h-4 w-4" />}
          registration={requestForm.register("email")}
          error={requestForm.formState.errors.email?.message}
        />

        <PillButton type="submit" disabled={ask.isPending} className="mt-9 w-full">
          {ask.isPending ? "Sending…" : "Email me a code"}
        </PillButton>

        <ErrorNotice error={ask.error} className="mt-4" />
      </form>
    );

  return (
    <form
      onSubmit={confirmForm.handleSubmit((payload) => confirm.mutate(payload))}
      noValidate
      className="mt-10"
    >
      <p className={cn(BODY, "mb-8 text-ink-muted")}>
        If <span className="text-ink">{sentTo}</span> has an account, a code is on
        its way. Enter it below with your new password.
      </p>

      <div className="grid grid-cols-1 gap-7">
        <Field
          id="reset-code"
          label="Six-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          icon={<HashIcon className="h-4 w-4" />}
          registration={confirmForm.register("code")}
          error={confirmForm.formState.errors.code?.message}
        />

        <Field
          id="reset-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon className="h-4 w-4" />}
          registration={confirmForm.register("password")}
          error={confirmForm.formState.errors.password?.message}
        />

        <Field
          id="reset-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon className="h-4 w-4" />}
          registration={confirmForm.register("confirm")}
          error={confirmForm.formState.errors.confirm?.message}
        />
      </div>

      <PillButton type="submit" disabled={confirm.isPending} className="mt-9 w-full">
        {confirm.isPending ? "Saving…" : "Set the new password"}
      </PillButton>

      <ErrorNotice error={confirm.error} className="mt-4" />

      <button
        type="button"
        onClick={() => {
          setSentTo(null);
          ask.reset();
          confirm.reset();
        }}
        className={cn(NOTICE, "mt-4 text-brand hover:text-ink")}
      >
        Use a different address
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
