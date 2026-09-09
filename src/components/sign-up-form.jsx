"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signUpSchema } from "@/lib/schemas/user";
import Field from "@/components/ui/field";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { BODY, NOTICE } from "@/lib/type";

const SignUpForm = ({ available }) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (values) => {
    setSubmitError(null);

    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(body.error ?? "Could not create the account.");
        return;
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      router.push("/account");
      router.refresh();
    } catch {
      setSubmitError("Network error. Try again.");
    }
  };

  if (!available)
    return (
      <p className={cn(BODY, "mt-10 text-black/70")}>
        Accounts need a database, and this deployment has none configured. Guest
        checkout still works.
      </p>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10">
      <div className="grid grid-cols-1 gap-7">
        <Field
          id="name"
          label="Name"
          icon={<UserIcon className="h-4 w-4" />}
          autoComplete="name"
          registration={register("name")}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password?.message}
        />
        <Field
          id="confirm"
          label="Confirm password"
          icon={<LockIcon className="h-4 w-4" />}
          type="password"
          autoComplete="new-password"
          registration={register("confirm")}
          error={errors.confirm?.message}
        />
      </div>

      <PillButton type="submit" disabled={isSubmitting} className="mt-9 w-full">
        {isSubmitting ? "Creating…" : "Create account"}
      </PillButton>

      <p aria-live="polite" className={cn(NOTICE, "mt-4 text-sale")}>
        {submitError ?? " "}
      </p>
    </form>
  );
};

export default SignUpForm;
