import { Suspense } from "react";
import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import SignInForm from "@/components/sign-in-form";
import { authIsAvailable } from "@/lib/api/users";
import { title } from "@/lib/brand";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

export const metadata = {
  title: title("Sign in"),
  robots: { index: false, follow: false },
};

const SignInPage = () => (
  <InteriorPage heading="Sign in" className="max-w-[440px]">
    <Suspense fallback={null}>
      <SignInForm available={authIsAvailable()} />
    </Suspense>

    <p className={cn(META, "mt-8 text-ink-soft")}>
      No account yet?{" "}
      <Link href="/sign-up" className="text-blurple hover:underline">
        Create one
      </Link>
    </p>

    <p className={cn(META, "mt-3 text-ink-soft")}>
      Forgotten your password?{" "}
      <Link href="/forgot-password" className="text-blurple hover:underline">
        Email me a reset code
      </Link>
    </p>
  </InteriorPage>
);

export default SignInPage;
