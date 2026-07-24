import type { Metadata } from "next";
import { Lora, Fraunces, DM_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { DISPLAY_FONT } from "@/lib/flags";
import SmoothScroll from "@/components/SmoothScroll";

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

// A/B experiment — warmer display serif, gated by lib/flags.ts.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Editorial body serif-alternative — the Figma "Slow Lake" concept sets the
// Welcome/About prose in Nunito while the rest of the site stays DM Sans.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lilaclanding.com"),
  title: "Lilac Landing | Keuka Lake Vacation Rental",
  description:
    "A gorgeous cozy lakehouse on Keuka Lake, NY. Sunset views, private dock, 3 bedrooms + Family Room, 8 guests. Book direct, no Airbnb fees.",
  openGraph: {
    title: "Lilac Landing | Keuka Lake",
    description:
      "Book direct. Swim, fish, and watch the sunset on Keuka Lake.",
    images: ["/photos/photo_01_exterior.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${fraunces.variable} ${dmSans.variable} ${nunito.variable}`}
      style={
        DISPLAY_FONT === "fraunces"
          ? ({ "--font-display-active": "var(--font-fraunces)" } as React.CSSProperties)
          : undefined
      }
    >
      <body className="antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
