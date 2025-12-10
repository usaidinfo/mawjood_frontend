'use client';

interface AboutCityProps {
  about?: string | null;
  cityName?: string;
}

export default function AboutCity({ about, cityName }: AboutCityProps) {
  if (!about) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About {cityName}</h2>
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-100">
        <div 
          className="text-sm sm:text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: about }}
        />
      </div>
    </section>
  );
}

