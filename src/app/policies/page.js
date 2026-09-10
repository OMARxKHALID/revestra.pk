import InteriorPage from "@/components/interior-page";
import { getSettings } from "@/lib/api/settings";
import { title } from "@/lib/brand";
import cn from "@/lib/utils/cn";
import { BODY, HEADING } from "@/lib/type";

export const metadata = {
  title: title("Policies"),
  description: "Shipping, returns, privacy and terms.",
};

const PoliciesPage = async () => {
  const { policies, email, phone } = await getSettings();

  return (
    <InteriorPage
      heading="Policies"
      intro="How we ship, how returns work, what we do with your details."
    >
      <div className="grid max-w-[720px] gap-12">
        {policies.map(({ slug, title: heading, body }) => (
          <section key={slug} id={slug} className="scroll-mt-[--spacing-header]">
            <h2 className={cn(HEADING, "text-ink")}>{heading}</h2>

            <p className={cn(BODY, "mt-4 whitespace-pre-line text-ink-soft")}>
              {body}
            </p>
          </section>
        ))}

        <section id="contact" className="scroll-mt-[--spacing-header]">
          <h2 className={cn(HEADING, "text-ink")}>Contact</h2>

          <p className={cn(BODY, "mt-4 text-ink-soft")}>
            Questions about an order or a policy, write to{" "}
            <a href={`mailto:${email}`} className="text-blurple hover:underline">
              {email}
            </a>
            {phone ? (
              <>
                {" "}
                or call{" "}
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="text-blurple hover:underline"
                >
                  {phone}
                </a>
              </>
            ) : null}
            .
          </p>
        </section>
      </div>
    </InteriorPage>
  );
};

export default PoliciesPage;
