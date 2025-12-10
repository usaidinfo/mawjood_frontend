import { Metadata } from 'next';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';
import { API_BASE_URL } from '@/config/api.config';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

// Server-side fetch function for tourist place
async function fetchTouristPlaceBySlug(slug: string) {
  try {
    const baseUrl = API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/tourist-places/slug/${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Tourist place not found');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tourist place:', error);
    throw error;
  }
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { slug } = await params;
  try {
    const place = await fetchTouristPlaceBySlug(slug);

    if (!place || !place.isActive) {
      return {
        title: 'Tourist Place Not Found | Mawjood',
        description: 'The tourist place you are looking for could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = place.metaTitle || `${place.title} - ${place.city.name} Travel Guide | Mawjood`;
    const description = place.metaDescription || 
      (place.about 
        ? place.about.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
        : `Discover ${place.title} in ${place.city.name}. Explore top attractions, best hotels, restaurants, and travel tips.`);

    // Get first gallery image for OG image
    const galleryImages = Array.isArray(place.galleryImages)
      ? place.galleryImages
      : place.galleryImages
        ? JSON.parse(place.galleryImages as any)
        : [];
    const mainImage = galleryImages[0] || null;
    const { absolute: ogImage } = buildOgImages(mainImage);
    const canonical = toAbsoluteUrl(`/tourist-places/${place.slug}`);

    // Parse keywords
    const keywords = place.keywords
      ? (Array.isArray(place.keywords) 
          ? place.keywords.join(', ')
          : typeof place.keywords === 'string'
            ? place.keywords
            : '')
      : `${place.title}, ${place.city.name}, travel guide, tourism, attractions, hotels, restaurants`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: mainImage ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: place.title,
          },
        ] : [],
        type: 'website',
        locale: 'en_US',
        siteName: 'Mawjood',
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: mainImage ? [ogImage] : [],
      },
      alternates: {
        canonical,
      },
      robots: {
        index: place.isActive,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Tourist Place Not Found | Mawjood',
      description: 'The tourist place you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function TouristPlaceLayout({ children, params }: Props) {
  await params;
  return <>{children}</>;
}

