import DietPlanner from "./DietPlanner";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (productionHost ? `https://${productionHost}` : "http://localhost:3000");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#application`,
      name: "میزانه",
      url: siteUrl,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: "fa-IR",
      description:
        "ابزار برنامه‌ریزی غذایی هفتگی با محاسبه انرژی، درشت‌مغذی‌ها، فیبر، فهرست خرید و نقشه آماده‌سازی.",
      featureList: [
        "محاسبه سوخت‌وساز پایه و انرژی روزانه",
        "جدول غذایی هفت‌روزه",
        "چیدمان‌های متنوع، سریع، آماده‌سازی جمعی و پروتئین‌محور",
        "جایگزین‌های هم‌گروه",
        "فهرست خرید دسته‌بندی‌شده",
        "نقشه آماده‌سازی وعده‌ها",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/#howto`,
      name: "چگونه برنامه غذایی هفتگی خود را بسازیم",
      inLanguage: "fa-IR",
      totalTime: "PT4M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "ثبت داده‌های پایه",
          text: "سن، قد، وزن، جنسیت و میزان تحرک را وارد کنید.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "تعیین هدف و ریتم",
          text: "وزن هدف، آهنگ کاهش وزن و تعداد وعده‌ها را مشخص کنید.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "ثبت سبک و ترجیحات",
          text: "سبک غذایی، حساسیت‌ها، زمان آشپزی و الگوی روز خود را انتخاب کنید.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "مرور برنامه کامل",
          text: "جدول هفتگی، جزئیات سهم‌ها، جایگزین‌ها، فهرست خرید و نقشه آماده‌سازی را مرور کنید.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      inLanguage: "fa-IR",
      mainEntity: [
        {
          "@type": "Question",
          name: "انرژی روزانه چگونه برآورد می‌شود؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "سوخت‌وساز پایه با معادله میفلین–سن ژئور برآورد می‌شود، سپس ضریب فعالیت و کسری کنترل‌شده برای هدف کاهش وزن اعمال می‌گردد.",
          },
        },
        {
          "@type": "Question",
          name: "آیا می‌توان روزهای برنامه را جابه‌جا کرد؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "بله. روزها و وعده‌های هم‌رده قابل جابه‌جایی‌اند؛ کافی است سهم و مجموع روزانه نزدیک به هدف حفظ شود.",
          },
        },
        {
          "@type": "Question",
          name: "چطور ترکیب تازه‌ای از غذاها دریافت کنم؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "با انتخاب چیدمان تازه یا تغییر حالت برنامه، ترکیب دیگری از غذاهای سازگار ساخته می‌شود.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <DietPlanner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
