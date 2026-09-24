import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const TrackingLine = ({ tracking, className }) => {
  if (!tracking?.courier && !tracking?.number) return null;

  const details = [
    tracking.courier && `Courier: ${tracking.courier}`,
    tracking.number && `Tracking: ${tracking.number}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <p className={cn(META, "mt-4 text-ink-soft", className)}>
      {details}
      {tracking.url && (
        <>
          {" · "}
          <a
            href={tracking.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            Track parcel
          </a>
        </>
      )}
    </p>
  );
};

export default TrackingLine;
