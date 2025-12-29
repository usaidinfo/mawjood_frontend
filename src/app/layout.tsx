import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://mawjoodfrontend.vercel.app';
const ogImage = `${siteUrl}/logo/logo3.png`;

export const metadata: Metadata = {
  title: 'Mawjood: Find Businesses Near You on Local Search Engine',
  description: 'Mawjood, Saudi Arabia\'s No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more. Find addresses, phone numbers, reviews and ratings, photos, maps of businesses.',
  keywords: 'local search, business directory, Saudi Arabia, restaurants, hotels, salons, real estate, travel, healthcare, education, B2B businesses',
  openGraph: {
    title: 'Mawjood: Find Businesses Near You on Local Search Engine',
    description: 'Mawjood, Saudi Arabia\'s No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mawjood',
    url: siteUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Mawjood - Saudi Arabia\'s Local Business Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mawjood: Find Businesses Near You on Local Search Engine',
    description: 'Mawjood, Saudi Arabia\'s No. 1 local search engine, for Restaurants, Hotels, Salons, Real Estate, Travel, Healthcare, Education, B2B Businesses and more.',
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteUrl}/`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cloudinaryUrl = 'https://res.cloudinary.com';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to important origins for faster resource loading */}
        {apiBaseUrl && (
          <>
            <link rel="preconnect" href={apiBaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiBaseUrl} />
          </>
        )}
        <link rel="preconnect" href={cloudinaryUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={cloudinaryUrl} />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Mawjood",
              "alternateName": "Mawjood Saudi Business Directory",
              "url": `${siteUrl}/`,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}