import { Badge } from "@/components/ui/badge";

const TONES = {
  delivered: "default",
  shipped: "secondary",
  processing: "secondary",
  received: "secondary",
  pending_payment: "outline",
  cancelled: "destructive",
  failed: "destructive",
  available: "secondary",
  reserved: "outline",
  sold: "default",
  published: "secondary",
  hidden: "outline",
};

const LABELS = {
  pending_payment: "Awaiting payment",
};

const StatusBadge = ({ status }) => (
  <Badge variant={TONES[status] ?? "outline"} className="capitalize">
    {LABELS[status] ?? status}
  </Badge>
);

export default StatusBadge;
