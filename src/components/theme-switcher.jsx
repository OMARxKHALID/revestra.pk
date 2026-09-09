"use client";

import cn from "@/lib/utils/cn";

const ICON_PROPS = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const SparklesIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M9.94 6.06 9 3l-.94 3.06L5 7l3.06.94L9 11l.94-3.06L13 7z" />
    <path d="M18 10.5 17.4 8.6 15.5 8l1.9-.6L18 5.5l.6 1.9 1.9.6-1.9.6z" />
    <path d="M16.5 19.5 15.6 16.9 13 16l2.6-.9.9-2.6.9 2.6 2.6.9-2.6.9z" />
  </svg>
);

const TypeIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M4 7V5h16v2" />
    <path d="M12 5v14" />
    <path d="M9 19h6" />
  </svg>
);

const MoonIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5" />
  </svg>
);

const THEMES = [
  { id: "jitter", label: "Jitter", Icon: SparklesIcon },
  { id: "serif", label: "Serif", Icon: TypeIcon },
  { id: "transparent", label: "Transparent", Icon: MoonIcon },
];

const ThemeSwitcher = ({ theme, setTheme }) => (
  <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:bottom-10 sm:left-10 sm:translate-x-0">
    <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-white/45">
      THEME:
    </span>
    <div className="flex items-center gap-2">
      {THEMES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={`${label} theme`}
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className={cn(
            "relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            "before:absolute before:-inset-2 before:content-['']",
            theme === id
              ? "border-blurple bg-blurple text-white shadow-[0_0_0_3px_rgba(54,103,246,0.25)]"
              : "border-white/20 bg-white/5 text-white/70 hover:border-white/45 hover:text-white"
          )}
        >
          <Icon />
        </button>
      ))}
    </div>
  </div>
);

export default ThemeSwitcher;
