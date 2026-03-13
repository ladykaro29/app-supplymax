import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Supplymax | Premium Sports Nutrition & Apparel",
  description: "Next-generation sports supplements and fitness apparel. Bimonetary store with expert coaching and influencer rewards.",
  keywords: "suplementos, venezuela, proteina, creatina, fitness, gym, ropa deportiva, supplymax, rendimiento",
  openGraph: {
    title: "Supplymax | Premium Sports Nutrition & Apparel",
    description: "La nutrición deportiva más avanzada con envíos a toda Venezuela y pagos locales sin complicaciones.",
    url: "https://supplymax.app", // Ideally environment based
    siteName: "Supplymax",
    images: [
      {
        url: "/protein.png", // A fallback OG Image
        width: 800,
        height: 600,
        alt: "Supplymax Products",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supplymax | Premium Sports Nutrition & Apparel",
    description: "Next-generation sports supplements and fitness apparel.",
    images: ["/protein.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
