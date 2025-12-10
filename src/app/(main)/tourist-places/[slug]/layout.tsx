import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // This will be handled client-side, but we provide a fallback
  return {
    title: 'Tourist Place Guide | Mawjood',
    description: 'Discover amazing tourist destinations and travel guides',
  };
}

export default function TouristPlaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

