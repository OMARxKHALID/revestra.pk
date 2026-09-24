import { Suspense } from "react";
import SiteHeader from "@/components/site-header";
import AnnouncementBar from "@/components/announcement-bar";
import Footer from "@/components/footer";
import SpiralTexture from "@/components/ui/spiral-texture";
import cn from "@/lib/utils/cn";
import { BODY, DISPLAY, EYEBROW } from "@/lib/type";

const InteriorPage = ({
  heading,
  intro,
  eyebrow,
  eyebrowTone = "text-brand",
  centered = false,
  texture = false,
  className,
  children,
}) => (
  <main id="main" className="flex min-h-svh flex-col bg-white">
    <Suspense fallback={null}>
      <AnnouncementBar />
    </Suspense>

    <SiteHeader />

    <section
      className={cn(
        "flex-1 px-6 sm:px-10",
        texture && "relative isolate overflow-clip",
        centered
          ? "flex items-center py-24"
          : "pb-24 pt-12 sm:pb-32 sm:pt-16"
      )}
    >
      {texture && (
        <SpiralTexture className="left-1/2 top-1/2 w-[min(640px,120vw)] -translate-x-1/2 -translate-y-1/2 text-brand opacity-[0.06]" />
      )}

      <div
        className={cn(
          "mx-auto w-full max-w-[900px]",
          centered && "text-center",
          className
        )}
      >
        {eyebrow && <p className={cn(EYEBROW, eyebrowTone)}>{eyebrow}</p>}

        <h1 className={cn(DISPLAY, "text-ink", eyebrow && "mt-4")}>
          {heading}
        </h1>

        {intro && (
          <p
            className={cn(
              BODY,
              "mt-5 max-w-[52ch] text-ink-muted",
              centered && "mx-auto max-w-[46ch]"
            )}
          >
            {intro}
          </p>
        )}

        {children}
      </div>
    </section>

    <Footer />
  </main>
);

export default InteriorPage;
