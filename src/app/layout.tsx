import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.massescoalitionfornigeria.com"),
  title: { default: "Masses Coalition of Nigeria | Independent News", template: "%s | Masses Coalition of Nigeria" },
  description: "Independent Nigerian journalism, original reporting and public-interest stories.",
  alternates: { canonical: process.env.SITE_URL || "https://www.massescoalitionfornigeria.com" },
  openGraph: { type: "website", siteName: "Masses Coalition of Nigeria", title: "Masses Coalition of Nigeria", description: "Independent Nigerian journalism and public-interest reporting." },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG"><body>{children}</body></html>;
}
