import localFont from "next/font/local";

export const inter = localFont({
  src: [
    { path: "../../public/assets/fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["-apple-system", "Segoe UI", "sans-serif"],
});

export const ptSerif = localFont({
  src: "../../public/assets/fonts/pt-serif-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-pt-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
