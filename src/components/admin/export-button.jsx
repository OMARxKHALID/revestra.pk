import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const ExportButton = ({ href, label = "Export CSV" }) => (
  <Button variant="outline" size="sm" render={<a href={href} download />}>
    <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
    {label}
  </Button>
);

export default ExportButton;
