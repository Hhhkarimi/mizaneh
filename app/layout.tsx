import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/noto-nastaliq-urdu";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (productionHost ? `https://${productionHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "میزانه | برنامه غذایی علمی و هفتگی",
    template: "%s | میزانه",
  },
  description:
    "برنامه غذایی هفتگی متناسب با هدف کاهش وزن، محاسبه انرژی روزانه، پروتئین، فیبر، فهرست خرید و آماده‌سازی وعده‌ها.",
  applicationName: "میزانه",
  keywords: [
    "برنامه غذایی هفتگی",
    "کاهش وزن اصولی",
    "محاسبه کالری روزانه",
    "برنامه غذایی ایرانی",
    "پروتئین و فیبر",
    "فهرست خرید هفتگی",
  ],
  authors: [{ name: "میزانه" }],
  creator: "میزانه",
  publisher: "میزانه",
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
    },
  },
  category: "health",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "میزانه",
    title: "میزانه؛ برنامه غذایی علمی و هفتگی",
    description:
      "از محاسبه انرژی تا جدول هفتگی، جایگزین‌ها، فهرست خرید و نقشه آماده‌سازی وعده‌ها.",
    url: siteUrl,
    images: [
      {
        url: "/og-mizaneh.png",
        width: 1200,
        height: 630,
        alt: "میزانه؛ تعادل روشن، ریتم پایدار",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "میزانه | برنامه غذایی علمی و هفتگی",
    description:
      "محاسبه انرژی و ساخت جدول غذایی هفت‌روزه با گزینه‌های متنوع و قابل جایگزینی.",
    images: ["/og-mizaneh.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#102c2a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa-IR" dir="rtl">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
