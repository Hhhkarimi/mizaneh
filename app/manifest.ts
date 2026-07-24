import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "میزانه | برنامه غذایی علمی و هفتگی",
    short_name: "میزانه",
    description:
      "محاسبه انرژی و ساخت جدول غذایی هفت‌روزه با فهرست خرید و نقشه آماده‌سازی.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#102c2a",
    lang: "fa-IR",
    dir: "rtl",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
