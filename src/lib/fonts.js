import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  fallback: ["-apple-system", "Segoe UI", "sans-serif"],
});

export const fontVariables = [spaceGrotesk.variable];
