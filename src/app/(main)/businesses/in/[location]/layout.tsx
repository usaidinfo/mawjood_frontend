import { Metadata } from 'next';
import { toAbsoluteUrl } from '@/config/seo.config';

interface Props {
  params: Promise<{ location: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { location } = await params;
  
  // Format location name for display (replace hyphens with spaces and capitalize)
  const locationName = location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `All Businesses in ${locationName} | Mawjood`;
  const description = `Discover the best local businesses in ${locationName}. Find restaurants, shops, services, and more with reviews, ratings, and contact information.`;
  const canonical = toAbsoluteUrl(`/businesses/in/${location}`);

  return {
    title,
    description,
    keywords: `businesses in ${locationName}, ${locationName} businesses, local businesses ${locationName}, ${locationName} directory, find businesses ${locationName}`,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Mawjood',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BusinessesByLocationLayout({ children, params }: Props) {
  await params;
  return <>{children}</>;
}

