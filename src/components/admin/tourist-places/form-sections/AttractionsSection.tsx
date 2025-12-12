'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Attraction {
  name: string;
  image: string;
  imageFile?: File;
  imagePreview?: string;
  rating: number;
  description: string;
  openTime: string;
  closeTime: string;
  order: number;
}

interface AttractionsSectionProps {
  attractions: Attraction[];
  onAttractionsChange: (attractions: Attraction[]) => void;
}

const parseTime = (timeStr: string) => {
  if (!timeStr || !timeStr.includes(':')) return { hour: 9, minute: 0 };
  const [hour, minute] = timeStr.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? (hour as number) : 9,
    minute: Number.isFinite(minute) ? (minute as number) : 0,
  };
};

const TimePickerContent = ({ 
  timeStr, 
  onTimeChange 
}: { 
  timeStr: string; 
  onTimeChange: (time: string) => void;
}) => {
  const defaultTime = timeStr || '09:00';
  const { hour: currentHour, minute: currentMinute } = parseTime(defaultTime);

  const handleTimeChange = (hour: number, minute: number) => {
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onTimeChange(formattedTime);
  };

  return (
    <div className="flex gap-4 p-3">
      <div className="w-16 max-h-48 overflow-y-auto">
        <div className="mb-2 text-center text-xs font-semibold text-gray-500">Hours</div>
        {Array.from({ length: 24 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleTimeChange(i, currentMinute)}
            className={`block w-full rounded-md px-2 py-2 text-sm transition-colors ${
              currentHour === i ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-100'
            }`}
          >
            {String(i).padStart(2, '0')}
          </button>
        ))}
      </div>

      <div className="w-18 max-h-48 overflow-y-auto border-l border-gray-200 p-3">
        <div className="mb-2 text-center text-xs font-semibold text-gray-500">Minutes</div>
        {Array.from({ length: 60 }, (_, i) => i).map((min) => (
          <button
            key={min}
            type="button"
            onClick={() => handleTimeChange(currentHour, min)}
            className={`block w-full rounded-md px-2 py-2 text-sm transition-colors ${
              currentMinute === min ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-100'
            }`}
          >
            {String(min).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
};

export function AttractionsSection({
  attractions,
  onAttractionsChange,
}: AttractionsSectionProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});
  const [openTimePickers, setOpenTimePickers] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleTimePicker = (key: string) => {
    setOpenTimePickers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addAttraction = () => {
    onAttractionsChange([
      ...attractions,
      {
        name: '',
        image: '',
        rating: 0,
        description: '',
        openTime: '',
        closeTime: '',
        order: attractions.length,
      },
    ]);
  };

  const updateAttraction = (index: number, field: keyof Attraction, value: any) => {
    const updated = [...attractions];
    updated[index] = { ...updated[index], [field]: value };
    onAttractionsChange(updated);
  };

  const removeAttraction = (index: number) => {
    onAttractionsChange(attractions.filter((_, i) => i !== index));
  };

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...attractions];
      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: reader.result as string,
        image: '', // Clear URL if file is uploaded
      };
      onAttractionsChange(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updated = [...attractions];
    updated[index] = {
      ...updated[index],
      imageFile: undefined,
      imagePreview: undefined,
      image: '',
    };
    onAttractionsChange(updated);
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Places to Visit</h2>
        <Button type="button" onClick={addAttraction} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Attraction
        </Button>
      </div>
      {attractions.map((attraction, index) => {
        const isExpanded = expandedItems[index] !== false; // Default to expanded for new items
        return (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
            {/* Collapsible Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {attraction.name || `Attraction ${index + 1}`}
                  </h3>
                  {attraction.name && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {attraction.rating > 0 ? `${attraction.rating} ⭐` : 'No rating'} • {attraction.description ? 'Has description' : 'No description'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttraction(index);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Name *</label>
                    <Input
                      placeholder="Enter attraction name"
                      value={attraction.name}
                      onChange={(e) => updateAttraction(index, 'name', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rating</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="0.0 - 5.0"
                      value={attraction.rating || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value)) {
                          updateAttraction(index, 'rating', 0);
                        } else if (value < 0) {
                          updateAttraction(index, 'rating', 0);
                        } else if (value > 5) {
                          updateAttraction(index, 'rating', 5);
                        } else {
                          updateAttraction(index, 'rating', value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value) || value < 0) {
                          updateAttraction(index, 'rating', 0);
                        } else if (value > 5) {
                          updateAttraction(index, 'rating', 5);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageUpload(index, file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      Choose File
                    </Button>
                    <span className="text-sm text-gray-500">
                      {attraction.imagePreview || attraction.image ? 'File chosen' : 'No file chosen'}
                    </span>
                    {(attraction.imagePreview || attraction.image) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {attraction.imagePreview || attraction.image ? (
                    <div className="mt-2 relative w-full h-48 border rounded-lg overflow-hidden">
                      <img
                        src={attraction.imagePreview || attraction.image}
                        alt={attraction.name || 'Attraction'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Enter a brief description of this attraction..."
                    value={attraction.description}
                    onChange={(e) => updateAttraction(index, 'description', e.target.value)}
                    className="w-full min-h-[100px]"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Open Time</label>
                    <Popover 
                      open={openTimePickers[`${index}-open`] || false} 
                      onOpenChange={(open) => toggleTimePicker(`${index}-open`)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary min-w-[120px]"
                        >
                          <span>{attraction.openTime || '09:00'}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <TimePickerContent 
                          timeStr={attraction.openTime} 
                          onTimeChange={(time) => updateAttraction(index, 'openTime', time)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Close Time</label>
                    <Popover 
                      open={openTimePickers[`${index}-close`] || false} 
                      onOpenChange={(open) => toggleTimePicker(`${index}-close`)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary min-w-[120px]"
                        >
                          <span>{attraction.closeTime || '18:00'}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <TimePickerContent 
                          timeStr={attraction.closeTime} 
                          onTimeChange={(time) => updateAttraction(index, 'closeTime', time)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {attractions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No attractions added yet. Click "Add Attraction" to get started.</p>
        </div>
      )}
    </div>
  );
}
