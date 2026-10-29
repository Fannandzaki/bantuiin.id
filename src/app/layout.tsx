import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bantuiin.id — Partner Solusi Akademik, IT & Kreatif",
  description:
    "Tugas Beres Tanpa Stres! Asisten proyek koding, perancangan database, desain visual & UI/UX, penulisan dokumen akademik, hingga servis dan optimasi perangkat laptop.",
  keywords: [
    "jasa joki tugas",
    "bantuan koding",
    "web development",
    "UI UX design figma",
    "servis laptop",
    "formatting skripsi word",
    "bantuiin id",
  ],
  authors: [{ name: "Bantuiin.id Team" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Bantuiin.id — Partner Solusi Akademik, IT & Kreatif",
    description: "Tugas Beres Tanpa Stres! Partner solusi akademik, IT, desain & riset digital terpercaya.",
    url: "https://bantuiin.id",
    siteName: "Bantuiin.id",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#c4f128",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`scroll-smooth ${spaceGrotesk.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-screen bg-white text-black font-body antialiased selection:bg-neo-lime selection:text-black">
        {children}
      </body>
    </html>
  );
}
