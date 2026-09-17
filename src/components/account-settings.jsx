"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Field from "@/components/ui/field";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { BODY, META, TITLE } from "@/lib/type";
import { request } from "@/lib/api-client";

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  postalCode: "",
  country: "Pakistan",
};

const Section = ({ title, note, children }) => (
  <section className="border-t border-rule pt-10">
    <h2 className={cn(TITLE, "text-ink")}>{title}</h2>
    {note && <p className={cn(META, "mt-2 text-ink-soft")}>{note}</p>}
    <div className="mt-6 grid max-w-[520px] gap-5">{children}</div>
  </section>
);

const AccountSettings = ({ account }) => {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: account.name ?? "",
    email: account.email ?? "",
  });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, ...(account.address ?? {}) });
  const [subscribed, setSubscribed] = useState(account.subscribed);
  const [password, setPassword] = useState("");

  const field = (setter) => (key) => (event) =>
    setter((current) => ({ ...current, [key]: event.target.value }));

  const saveProfile = useMutation({
    mutationFn: () => request("/api/account", { method: "PATCH", body: profile }),
    onSuccess: () => {
      toast.success("Profile saved");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const savePassword = useMutation({
    mutationFn: () => request("/api/account/password", { method: "PUT", body: passwords }),
    onSuccess: async () => {
      await signIn("credentials", {
        email: profile.email,
        password: passwords.next,
        redirect: false,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password changed. Other devices are signed out.");
    },
    onError: (error) => toast.error(error.message),
  });

  const saveAddress = useMutation({
    mutationFn: () => request("/api/account/address", { method: "PUT", body: address }),
    onSuccess: () => {
      toast.success("Address saved. Checkout will fill it in for you.");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const saveNewsletter = useMutation({
    mutationFn: (next) =>
      request("/api/account/newsletter", { method: "PUT", body: { subscribed: next } }),
    onSuccess: (_result, next) => {
      setSubscribed(next);
      toast.success(next ? "You are on the list" : "You are off the list");
    },
    onError: (error) => toast.error(error.message),
  });

  const removeAccount = useMutation({
    mutationFn: () => request("/api/account", { method: "DELETE", body: { password } }),
    onSuccess: async () => {
      toast.success("Your account is gone");
      await signOut({ callbackUrl: "/" });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleProfile = (event) => {
    event.preventDefault();
    saveProfile.mutate();
  };

  const handlePassword = (event) => {
    event.preventDefault();
    savePassword.mutate();
  };

  const handleAddress = (event) => {
    event.preventDefault();
    saveAddress.mutate();
  };

  const handleDelete = (event) => {
    event.preventDefault();

    if (
      window.confirm(
        "Delete your account? Your orders stay in our records for accounting, without your account attached."
      )
    )
      removeAccount.mutate();
  };

  return (
    <div className="mt-12 grid gap-12">
      <Section title="Your details">
        <form onSubmit={handleProfile} noValidate className="grid gap-5">
          <Field
            id="name"
            label="Name"
            value={profile.name}
            onChange={field(setProfile)("name")}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={profile.email}
            onChange={field(setProfile)("email")}
          />

          <PillButton type="submit" size="sm" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? "Saving…" : "Save details"}
          </PillButton>
        </form>
      </Section>

      <Section
        title="Password"
        note="Changing it signs out every other device within five minutes."
      >
        <form onSubmit={handlePassword} noValidate className="grid gap-5">
          <Field
            id="current"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={field(setPasswords)("current")}
          />
          <Field
            id="next"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={field(setPasswords)("next")}
          />
          <Field
            id="confirm"
            label="Repeat the new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={field(setPasswords)("confirm")}
          />

          <PillButton type="submit" size="sm" disabled={savePassword.isPending}>
            {savePassword.isPending ? "Changing…" : "Change password"}
          </PillButton>
        </form>
      </Section>

      <Section
        title="Delivery address"
        note="Saved here, checkout fills itself in next time."
      >
        <form onSubmit={handleAddress} noValidate className="grid gap-5">
          <Field
            id="address-name"
            label="Full name"
            value={address.name}
            onChange={field(setAddress)("name")}
          />
          <Field
            id="address-phone"
            label="Phone"
            placeholder="0300 1234567"
            value={address.phone}
            onChange={field(setAddress)("phone")}
          />
          <Field
            id="address-street"
            label="Street address"
            value={address.address}
            onChange={field(setAddress)("address")}
          />
          <Field
            id="address-apartment"
            label="Apartment (optional)"
            value={address.apartment}
            onChange={field(setAddress)("apartment")}
          />
          <Field
            id="address-city"
            label="City"
            value={address.city}
            onChange={field(setAddress)("city")}
          />
          <Field
            id="address-postal"
            label="Postal code"
            value={address.postalCode}
            onChange={field(setAddress)("postalCode")}
          />
          <Field
            id="address-country"
            label="Country"
            value={address.country}
            onChange={field(setAddress)("country")}
          />

          <PillButton type="submit" size="sm" disabled={saveAddress.isPending}>
            {saveAddress.isPending ? "Saving…" : "Save address"}
          </PillButton>
        </form>
      </Section>

      <Section title="Newsletter">
        <p className={cn(BODY, "text-ink-muted")}>
          {subscribed
            ? "You get an email when new pieces land."
            : "You are not on the list."}
        </p>

        <PillButton
          size="sm"
          onClick={() => saveNewsletter.mutate(!subscribed)}
          disabled={saveNewsletter.isPending}
        >
          {subscribed ? "Unsubscribe" : "Subscribe"}
        </PillButton>
      </Section>

      <Section
        title="Delete your account"
        note="Your orders stay in our records for accounting, with your account removed from them. Reviews stay published without your name attached."
      >
        <form onSubmit={handleDelete} noValidate className="grid gap-5">
          <Field
            id="delete-password"
            label="Confirm with your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <PillButton
            type="submit"
            size="sm"
            className="border-sale text-sale hover:bg-sale"
            disabled={removeAccount.isPending || password === ""}
          >
            {removeAccount.isPending ? "Deleting…" : "Delete my account"}
          </PillButton>
        </form>
      </Section>
    </div>
  );
};

export default AccountSettings;
