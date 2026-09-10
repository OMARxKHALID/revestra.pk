import Link from "next/link";
import Ticker from "@/components/ticker";
import MonogramMark from "@/components/monogram-mark";
import NewsletterForm from "@/components/newsletter-form";
import SocialIcon from "@/components/ui/social-icon";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import { getSettings } from "@/lib/api/settings";

const linkClass = cn(
  META,
  "relative text-blurple transition before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
);

const Footer = async () => {
  const settings = await getSettings();

  return (
  <footer className="bg-black text-white">
    <Ticker entries={settings.ticker} />

    <div className="mx-auto max-w-[1400px] px-6 py-14 sm:px-10 sm:py-16">
      <div className="grid grid-cols-1 items-center gap-12 sm:grid-cols-[1fr_auto_1fr] sm:gap-10">
        <address className={cn(META, "not-italic leading-[1.75] text-blurple")}>
          {settings.hours}
          <br />
          {settings.addressLine ? `${settings.addressLine}, ` : ""}
          {settings.city}
          <br />© {settings.legalName}, {new Date().getFullYear()}
        </address>

        <div className="flex flex-col items-start gap-5 sm:col-start-3 sm:row-start-1 sm:items-end">
          <NewsletterForm />

          <Link href="/reviews" className={linkClass}>
            Read our reviews
          </Link>

          <div className="flex items-center gap-3">
            <span className={cn(META, "text-blurple")}>Follow us on:</span>
            {settings.socials.map(({ name, label, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="relative text-blurple transition before:absolute before:-inset-2 before:content-[''] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <a href={`mailto:${settings.email}`} className={linkClass}>
              {settings.email}
            </a>

            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className={linkClass}>
                {settings.phone}
              </a>
            )}
          </div>
        </div>
        <div className="flex justify-center sm:col-start-2 sm:row-start-1">
          <MonogramMark className="h-20 w-auto invert sm:h-24" />
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
