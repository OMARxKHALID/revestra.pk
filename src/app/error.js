"use client";

import SiteHeader from "@/components/site-header";
import PillButton from "@/components/ui/pill-button";
import ErrorState from "@/components/ui/error-state";
import cn from "@/lib/utils/cn";
import { DISPLAY } from "@/lib/type";

const Error = ({ error, reset }) => (
  <main id="main" className="flex min-h-svh flex-col bg-white">
    <SiteHeader />

    <section className="flex flex-1 items-center px-6 sm:px-10">
      <div className="mx-auto w-full max-w-[900px]">
        <h1 className={cn(DISPLAY, "text-ink")}>We hit a snag</h1>

        <ErrorState
          error={error}
          actions={
            <>
              <PillButton onClick={reset}>Try again</PillButton>
              <PillButton href="/products">Back to the shop</PillButton>
            </>
          }
        />
      </div>
    </section>
  </main>
);

export default Error;
