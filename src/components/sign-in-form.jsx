"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/lib/schemas/user";
import Field from "@/components/ui/field";
import { LockIcon, MailIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import ErrorNotice from "@/components/ui/error-notice";
import cn from "@/lib/utils/cn";
import { BODY } from "@/lib/type";

const SignInForm = ({ available }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signInSchema) });

  const onSubmit = async ({ email, password }) => {
    setSubmitError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setSubmitError("That email and password do not match an account.");
      return;
    }

    const target = params.get("callbackUrl") ?? "";

    router.push(/^\/(?![/\\])/.test(target) ? target : "/account");
    router.refresh();
  };

  if (!available)
    return (
      <p className={cn(BODY, "mt-10 text-ink-muted")}>
        Accounts need a database, and this deployment has none configured. You
        can still browse, add to cart and check out as a guest.
      </p>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10">
      <div className="grid grid-cols-1 gap-7">
        <Field
          id="email"
          label="Email"
          icon={<MailIcon className="h-4 w-4" />}
          type="email"
          autoComplete="email"
          registration={register("email")}
          error={errors.email?.message}
        />
        <Field
          id="password"
          label="Password"
          icon={<LockIcon className="h-4 w-4" />}
          type="password"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password?.message}
        />
      </div>

      <PillButton type="submit" disabled={isSubmitting} className="mt-9 w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </PillButton>

      <ErrorNotice message={submitError} className="mt-4" />
    </form>
  );
};

export default SignInForm;
