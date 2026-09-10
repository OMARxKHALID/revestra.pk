"use client";

import { useEffect, useState } from "react";
import { META } from "@/lib/type";
import cn from "@/lib/utils/cn";

const ACCIDENT_FREE_SINCE = Date.UTC(2021, 5, 4);
const DAY = 86_400_000;

const ICON = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "shrink-0",
};

const GlobeIcon = () => (
  <svg {...ICON}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
  </svg>
);

const ClockIcon = () => (
  <svg {...ICON}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...ICON}>
    <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const readClock = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      hour: "numeric",
      hour12: false,
    }).format(now)
  );

  const [month, day, year] = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("/")
    .map(Number);

  return {
    time: `${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`,
    open: hour >= 9 && hour < 18,
    days: Math.round(
      (Date.UTC(year, month - 1, day) - ACCIDENT_FREE_SINCE) / DAY
    ),
  };
};

const ICONS = { globe: GlobeIcon, clock: ClockIcon, shield: ShieldIcon };

const Ticker = ({ entries = [] }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    const tick = () => setState(readClock());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const live = {
    clock: state
      ? `It's ${state.time} in Karachi, we're ${state.open ? "open" : "closed"}`
      : "Karachi time",
    shield: `${state ? state.days.toLocaleString("en-US") : "—"} days without an accident`,
  };

  const items = entries
    .map(({ icon, text }) => ({
      Icon: ICONS[icon] ?? GlobeIcon,
      text: text || live[icon] || "",
    }))
    .filter(({ text }) => text);

  if (items.length === 0) return null;

  const lane = [...items, ...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-black py-3.5">
      <div className="flex w-max motion-safe:animate-marquee">
        {[...lane, ...lane].map(({ Icon, text }, index) => (
          <span
            key={index}
            className={cn(META, "flex shrink-0 items-center gap-2 px-6 text-blurple")}
          >
            <Icon />
            <span className="whitespace-nowrap tabular-nums">{text}</span>
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
};

export default Ticker;
