import cn from "@/lib/utils/cn";

const Svg = ({ className, children }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("h-[18px] w-[18px] shrink-0", className)}
  >
    {children}
  </svg>
);

export const HeartIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M10 16.2c-.3 0-.6-.1-.8-.3C6.3 13.4 3 10.7 3 7.6a3.4 3.4 0 0 1 6.2-1.9l.8 1.1.8-1.1A3.4 3.4 0 0 1 17 7.6c0 3.1-3.3 5.8-6.2 8.3-.2.2-.5.3-.8.3Z" />
  </Svg>
);

export const UserIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="10" cy="6.6" r="3.1" />
    <path d="M3.9 16.6a6.4 6.4 0 0 1 12.2 0" />
  </Svg>
);

export const BagIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4.6 6.4h10.8l.8 10H3.8l.8-10Z" />
    <path d="M7.3 8.2V5.6a2.7 2.7 0 0 1 5.4 0v2.6" />
  </Svg>
);

export const SearchIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="9" cy="9" r="5.2" />
    <path d="m13 13 3.4 3.4" />
  </Svg>
);

export const MenuIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </Svg>
);

export const CloseIcon = ({ className }) => (
  <Svg className={className}>
    <path d="m5 5 10 10M15 5 5 15" />
  </Svg>
);

export const TrashIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4 6h12M8 6V4.6h4V6M6.3 6l.7 9.4h6l.7-9.4M8.6 8.6v4.4M11.4 8.6v4.4" />
  </Svg>
);

export const CheckIcon = ({ className }) => (
  <Svg className={className}>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </Svg>
);

export const TruckIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M2.6 5.4h8.2v7.8H2.6zM10.8 8.2h3l2.6 2.6v2.4h-5.6z" />
    <circle cx="6" cy="15.2" r="1.4" />
    <circle cx="13.4" cy="15.2" r="1.4" />
  </Svg>
);

export const WalletIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M3 6.4a1.4 1.4 0 0 1 1.4-1.4h9.8v2.4M3 6.4v8a1.4 1.4 0 0 0 1.4 1.4h11.2a1.4 1.4 0 0 0 1.4-1.4v-6a1.4 1.4 0 0 0-1.4-1.4H3Z" />
    <circle cx="13.6" cy="11.4" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const MailIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M2.8 5.8h14.4v8.4H2.8zM2.8 6.2l7.2 5 7.2-5" />
  </Svg>
);

export const PhoneIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M6.4 3.2 8 6.1l-1.5 1.6a9.4 9.4 0 0 0 5.8 5.8l1.6-1.5 2.9 1.6v2.6c0 .6-.5 1-1.1 1A13.4 13.4 0 0 1 2.8 3.9c0-.6.4-1.1 1-1.1h2.6Z" />
  </Svg>
);

export const PinIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M10 17.2c3.4-3.6 5.1-6.3 5.1-8.3a5.1 5.1 0 0 0-10.2 0c0 2 1.7 4.7 5.1 8.3Z" />
    <circle cx="10" cy="8.6" r="1.9" />
  </Svg>
);

export const LockIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4.8 8.8h10.4v7.4H4.8zM7.2 8.8V6.4a2.8 2.8 0 0 1 5.6 0v2.4" />
  </Svg>
);

export const TagIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M3.4 3.4h6l7.2 7.2-6 6-7.2-7.2z" />
    <circle cx="6.6" cy="6.6" r="1.1" />
  </Svg>
);

export const HashIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M7.4 3.2 5.8 16.8M14.2 3.2l-1.6 13.6M3.4 7.4h13.2M2.9 12.6h13.2" />
  </Svg>
);

export const PenIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M13.4 3.6 16.4 6.6 7 16H4v-3z" />
  </Svg>
);

export const GlobeIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="10" cy="10" r="7.2" />
    <path d="M2.8 10h14.4M10 2.8a11 11 0 0 1 0 14.4 11 11 0 0 1 0-14.4" />
  </Svg>
);

export const BuildingIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M4.4 17.2V4.4h7.6v12.8M12 8.8h3.6v8.4M2.8 17.2h14.4M6.8 7.2h2.4M6.8 10.4h2.4M6.8 13.6h2.4" />
  </Svg>
);
