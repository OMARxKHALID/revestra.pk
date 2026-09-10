"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signUpSchema } from "@/lib/schemas/user";
import Field from "@/components/ui/field";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import ErrorNotice from "@/components/ui/error-notice";
import cn from "@/lib/utils/cn";
import { BODY } from "@/lib/type";
import { request } from "@/lib/api-client";

const SignUpForm = ({ available }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const createAccount = useMutation({
    mutationFn: async (values) => {
      await request("/api/account/register", { body: values });

      return signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
    },
    onSuccess: () => {
      router.push("/account");
      router.refresh();
    },
  });

  const submitError = createAccount.isError ? createAccount.error.message : null;
  const handleCreateAccount = (values) => createAccount.mutate(values);

  if (!available)
    return (
      <p className={cn(BODY, "mt-10 text-ink-muted")}>
        Accounts need a database, and this deployment has none configured. Guest
        checkout still works.
      </p>
    );

  return (
    <form onSubmit={handleSubmit(handleCreateAccount)} noValidate className="mt-10">
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

      <PillButton type="submit" disabled={createAccount.isPending} className="mt-9 w-full">
        {createAccount.isPending ? "Creating…" : "Create account"}
      </PillButton>

      <ErrorNotice error={createAccount.error} className="mt-4" />
    </form>
  );
};

export default SignUpForm;
