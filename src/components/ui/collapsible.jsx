"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { cn } from "@/lib/utils";

const Collapsible = (props) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
);

const CollapsibleTrigger = ({ className, ...props }) => (
  <CollapsiblePrimitive.Trigger
    data-slot="collapsible-trigger"
    className={cn(
      "flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className
    )}
    {...props}
  />
);

const CollapsiblePanel = ({ className, ...props }) => (
  <CollapsiblePrimitive.Panel
    data-slot="collapsible-panel"
    className={cn(
      "overflow-hidden transition-[height] duration-200 ease-out h-[var(--collapsible-panel-height)] data-[ending-style]:h-0 data-[starting-style]:h-0",
      className
    )}
    {...props}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsiblePanel };
