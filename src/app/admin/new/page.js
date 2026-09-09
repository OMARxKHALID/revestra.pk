import IntakeForm from "@/components/intake-form";
import { title } from "@/lib/brand";
import { adminIsAvailable } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("List a piece"),
  robots: { index: false, follow: false },
};

const NewPiecePage = () => (
  <div>
    <h1 className="text-xl font-medium">List a piece</h1>
    <p className="mt-1 text-sm text-muted-foreground">
      Measure it flat, grade it honestly, and price it against what you paid.
    </p>

    {adminIsAvailable() ? (
      <IntakeForm />
    ) : (
      <p className="mt-10 text-sm text-muted-foreground">
        Listing needs a database. This deployment has none configured.
      </p>
    )}
  </div>
);

export default NewPiecePage;
