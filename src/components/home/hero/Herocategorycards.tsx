'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface HeroCard {
  id: string;
  title: string;
  buttonText: string;
  bgImage: string;
  slug: string;
}

interface HeroCategoryCardsProps {
  cards: HeroCard[];
  locationSlug: string;
  loading?: boolean;
}

export default function HeroCategoryCards({ cards, locationSlug, loading }: HeroCategoryCardsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`hero-skeleton-${idx}`}
            className="h-64 rounded-2xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {cards.slice(0, 4).map((card) => (
        <div
          key={card.id}
          onClick={() => router.push(`/${locationSlug}/${card.slug}`)}
          className="rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform cursor-pointer hover:scale-105 hover:shadow-xl relative h-60"
        >
          {/* Image Background */}
          <div className="absolute inset-0">
            <Image 
              src={card.bgImage} 
              alt={card.title} 
              fill 
              className="object-cover" 
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {/* Transparent Overlay with Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-between p-4 md:p-5 z-10">
            {/* Text Content at Top */}
            <div className="flex flex-col">
              <h3 className="text-base md:text-md text-white font-bold mb-1 leading-tight uppercase">
                {card.title}
              </h3>
              <p className="text-xs md:text-xs text-white/90">
                {card.buttonText}
              </p>
            </div>

            {/* Navigation Arrow at Bottom */}
            <div className="self-end bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}