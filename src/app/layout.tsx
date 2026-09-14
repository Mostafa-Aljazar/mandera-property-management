import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mandera Properties Management",
    template: "%s | Mandera",
  },
  description:
    "نظام لإدارة العقارات المؤجرة: وحدات، عقود، دفعات، مصروفات، صيانة، وإشعارات تلقائية لأصحاب العقارات",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
