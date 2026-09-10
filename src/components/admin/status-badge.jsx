import { Badge } from "@/components/ui/badge";

const TONES = {
  delivered: "success",
  available: "success",
  published: "success",
  shipped: "info",
  processing: "info",
  received: "info",
  pending_payment: "warning",
  reserved: "warning",
  sold: "neutral",
  hidden: "neutral",
  cancelled: "destructive",
  failed: "destructive",
};

const LABELS = {
  pending_payment: "Awaiting payment",
};

const StatusBadge = ({ status }) => (
  <Badge variant={TONES[status] ?? "neutral"} className="capitalize">
    {LABELS[status] ?? status}
  </Badge>
);

export default StatusBadge;
