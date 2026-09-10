import InteriorPage from "@/components/interior-page";
import ForgotPasswordForm from "@/components/forgot-password-form";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Reset your password"),
  robots: { index: false, follow: false },
};

const ForgotPasswordPage = () => (
  <InteriorPage
    eyebrow="Account"
    heading="Reset your password"
    className="max-w-[420px]"
  >
    <ForgotPasswordForm />
  </InteriorPage>
);

export default ForgotPasswordPage;
