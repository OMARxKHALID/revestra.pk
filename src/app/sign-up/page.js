import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import SignUpForm from "@/components/sign-up-form";
import { authIsAvailable } from "@/lib/api/users";
import { getSettings } from "@/lib/api/settings";
import { title } from "@/lib/brand";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

export const metadata = {
  title: title("Create account"),
  robots: { index: false, follow: false },
};

const SignUpPage = async () => {
  const { signupOpen } = await getSettings();

  return (
    <InteriorPage heading="Create an account" className="max-w-[440px]">
      <SignUpForm available={authIsAvailable() && signupOpen} />

      <p className={cn(META, "mt-8 text-ink-soft")}>
        Already have one?{" "}
        <Link href="/sign-in" className="text-blurple hover:underline">
          Sign in
        </Link>
      </p>
    </InteriorPage>
  );
};

export default SignUpPage;
