"use client";

import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";

const Error = ({ reset }) => (
  <InteriorPage
    centered
    eyebrow="Something broke"
    eyebrowTone="text-sale"
    heading="This page did not load"
    intro="The fault is on our side, not yours. Nothing in your cart was lost."
  >
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <PillButton onClick={reset}>Try again</PillButton>
      <PillButton href="/products">Back to the shop</PillButton>
    </div>
  </InteriorPage>
);

export default Error;
