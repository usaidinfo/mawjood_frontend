'use client';

interface BestTimeToVisitProps {
  data?: {
    winter?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
    summer?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
    monsoon?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
  } | null;
}

export default function BestTimeToVisit({ data }: BestTimeToVisitProps) {
  if (!data) return null;

  const seasons = [
    {
      key: 'winter',
      data: data.winter,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      checkColor: 'text-green-600',
    },
    {
      key: 'summer',
      data: data.summer,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      checkColor: 'text-orange-600',
    },
    {
      key: 'monsoon',
      data: data.monsoon,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      checkColor: 'text-red-600',
    },
  ].filter((season) => season.data);

  if (seasons.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Best Time To Visit
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">Navigate through the Calendar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {seasons.map((season) => (
          <div
            key={season.key}
            className={`${season.bgColor} ${season.borderColor} border-2 rounded-lg p-4 sm:p-6`}
          >
            <div className="mb-3 sm:mb-4">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                {season.data?.label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{season.data?.months}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${season.textColor} ${season.bgColor}`}
              >
                {season.data?.season}
              </span>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {season.data?.points?.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`${season.checkColor} mt-0.5 sm:mt-1 text-sm`}>✓</span>
                  <span className="text-xs sm:text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

