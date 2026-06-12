import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "ReconX — Passive OSINT & Domain Intelligence Dashboard",
  description: "ReconX is a professional browser-based OSINT & passive reconnaissance tool for security researchers and developers. Scan domain WHOIS, DNS, SSL, subdomains, IP, and security headers passively.",
  icons: {
    icon: "/logo.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
