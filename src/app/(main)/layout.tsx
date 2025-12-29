import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { I18nProvider } from "@/providers/I18nProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from '@/components/ui/sonner';
import EnquiryChatButton from "@/components/layout/EnquiryChatButton"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: false, // Only preload primary font
});

const siteUrl = 'https://mawjoodfrontend.vercel.app';
const ogImage = `${siteUrl}/logo/logo3.png`;

export const metadata: Metadata = {
  title: "Mawjood: Find Businesses Near You on Local Search Engine",
  description: "Mawjood, Saudi Arabia's No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more. Find addresses, phone numbers, reviews and ratings, photos, maps of businesses.",
  keywords: "local search, business directory, Saudi Arabia, restaurants, hotels, salons, real estate, travel, healthcare, education, B2B businesses",
  openGraph: {
    title: "Mawjood: Find Businesses Near You on Local Search Engine",
    description: "Mawjood, Saudi Arabia's No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more.",
    type: "website",
    locale: "en_US",
    siteName: "Mawjood",
    url: siteUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Mawjood - Saudi Arabia's Local Business Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mawjood: Find Businesses Near You on Local Search Engine",
    description: "Mawjood, Saudi Arabia's No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more.",
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteUrl}/`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <I18nProvider>
          <QueryProvider>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <EnquiryChatButton />
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </I18nProvider>
  );
}
