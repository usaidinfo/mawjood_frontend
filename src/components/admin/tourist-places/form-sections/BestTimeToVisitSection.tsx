'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SeasonData {
  label: string;
  months: string;
  season: string;
  points: string[];
}

interface BestTimeToVisitSectionProps {
  bestTimeToVisit: {
    winter: SeasonData;
    summer: SeasonData;
    monsoon: SeasonData;
  };
  onBestTimeToVisitChange: (data: {
    winter: SeasonData;
    summer: SeasonData;
    monsoon: SeasonData;
  }) => void;
}

const seasonOptions = ['Peak Season', 'Moderate Season', 'Off Season'];

const seasonConfig = {
  winter: {
    title: 'Winter Season',
    months: 'Oct to Mar',
  },
  summer: {
    title: 'Summer Season',
    months: 'Apr to Jun',
  },
  monsoon: {
    title: 'Monsoon Season',
    months: 'Jul to Sept',
  },
};

export function BestTimeToVisitSection({
  bestTimeToVisit,
  onBestTimeToVisitChange,
}: BestTimeToVisitSectionProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<{ [key: string]: boolean }>({
    winter: true,
    summer: true,
    monsoon: true,
  });

  const toggleSeason = (season: string) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [season]: !prev[season]
    }));
  };

  const updateSeason = (season: 'winter' | 'summer' | 'monsoon', field: keyof SeasonData, value: any) => {
    onBestTimeToVisitChange({
      ...bestTimeToVisit,
      [season]: {
        ...bestTimeToVisit[season],
        [field]: value,
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-xl font-semibold">Best Time to Visit</h2>
      {(['winter', 'summer', 'monsoon'] as const).map((season) => {
        const config = seasonConfig[season];
        const isExpanded = expandedSeasons[season] !== false;
        
        return (
          <div key={season} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
            {/* Collapsible Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSeason(season)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{config.months}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
              <div className="p-4 space-y-4 bg-white border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Season Type
                    </label>
                    <Select
                      value={bestTimeToVisit[season].season}
                      onValueChange={(value) => updateSeason(season, 'season', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select season type" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasonOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Duration
                    </label>
                    <Input
                      value={config.months}
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Add Points
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentPoints = bestTimeToVisit[season].points || [];
                        updateSeason(season, 'points', [...currentPoints, '']);
                      }}
                      className="h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Point
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bestTimeToVisit[season].points.length > 0 ? (
                      bestTimeToVisit[season].points.map((point, pointIndex) => (
                        <div key={pointIndex} className="flex items-center gap-2">
                          <Input
                            placeholder={`Point ${pointIndex + 1}`}
                            value={point}
                            onChange={(e) => {
                              const currentPoints = [...bestTimeToVisit[season].points];
                              currentPoints[pointIndex] = e.target.value;
                              updateSeason(season, 'points', currentPoints);
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentPoints = bestTimeToVisit[season].points.filter(
                                (_, idx) => idx !== pointIndex
                              );
                              updateSeason(season, 'points', currentPoints);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500 border border-dashed rounded-lg">
                        No points added yet. Click "Add Point" to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

