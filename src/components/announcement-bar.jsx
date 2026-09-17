import Link from "next/link";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import { getSettings } from "@/lib/api/settings";
import { activeAnnouncement } from "@/lib/utils/announcement";

const AnnouncementBar = async () => {
  const { announcement } = await getSettings();
  const active = activeAnnouncement(announcement);

  if (!active) return null;

  const text = <span className={cn(META, "text-white")}>{active.text}</span>;

  return (
    <div className="bg-blurple px-5 py-2.5 text-center">
      {active.href ? (
        <Link
          href={active.href}
          className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {text}
        </Link>
      ) : (
        text
      )}
    </div>
  );
};

export default AnnouncementBar;
