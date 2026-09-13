import type { Metadata } from "next";
import { Anton, Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "6–7 Clicker — Aura Farm",
  description:
    "Brainrot klikker a 6–7 mémre. Kattints, weighingeld, farmold az aurát, amíg a mém meg nem hal — aztán prestige: we're so back.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${anton.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070709] font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
