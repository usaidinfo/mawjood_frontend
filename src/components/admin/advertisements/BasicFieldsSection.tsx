'use client';

import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/datetime-picker';

interface BasicFieldsSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
  targetUrl: string;
  onTargetUrlChange: (value: string) => void;
  openInNewTab: boolean;
  onOpenInNewTabChange: (value: boolean) => void;
  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;
  startsAt: Date | null;
  onStartsAtChange: (date: Date | null) => void;
  endsAt: Date | null;
  onEndsAtChange: (date: Date | null) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  submitting: boolean;
  errors: Record<string, string>;
}

export default function BasicFieldsSection({
  title,
  onTitleChange,
  targetUrl,
  onTargetUrlChange,
  openInNewTab,
  onOpenInNewTabChange,
  isActive,
  onIsActiveChange,
  startsAt,
  onStartsAtChange,
  endsAt,
  onEndsAtChange,
  notes,
  onNotesChange,
  submitting,
  errors,
}: BasicFieldsSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Special Offer"
            disabled={submitting}
            className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm ${
              errors.title ? 'border-red-500' : ''
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Target URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="target-url">
            Redirect URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="target-url"
            value={targetUrl}
            onChange={(e) => onTargetUrlChange(e.target.value)}
            placeholder="https://example.com or /businesses/slug"
            disabled={submitting}
            className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm ${
              errors.targetUrl ? 'border-red-500' : ''
            }`}
          />
          {errors.targetUrl && <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Where users will be redirected when they click the ad
          </p>
        </div>

        {/* Open in new tab checkbox */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Behavior</label>
          <div className="mt-2 flex items-center">
            <input
              id="openInNewTab"
              name="openInNewTab"
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => onOpenInNewTabChange(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-gray-300 text-[#1c4233] focus:ring-[#1c4233]"
            />
            <label htmlFor="openInNewTab" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
              Open link in new tab
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If checked, clicking the ad will open the link in a new browser tab
          </p>
        </div>

        {/* Active checkbox */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
          <div className="mt-2 flex items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-gray-300 text-[#1c4233] focus:ring-[#1c4233]"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
              Show this banner on the site
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Start and End dates */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start at (optional)
            </label>
            <div className="w-full">
              <DateTimePicker
                value={startsAt}
                onChange={(date) => onStartsAtChange(date)}
                disabled={submitting}
                className="w-full [&>button]:truncate [&>button]:text-sm [&>button>span]:truncate [&>button>svg]:flex-shrink-0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If empty, the banner will start showing immediately.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End at (optional)
            </label>
            <div className="w-full">
              <DateTimePicker
                value={endsAt}
                onChange={(date) => onEndsAtChange(date)}
                disabled={submitting}
                className="w-full [&>button]:truncate [&>button]:text-sm [&>button>span]:truncate [&>button>svg]:flex-shrink-0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If empty, the banner will keep showing until you disable it.
            </p>
          </div>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="internal-notes">
            Internal Notes
          </label>
          <textarea
            id="internal-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            disabled={submitting}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm resize-none p-3"
            placeholder="Optional notes about this advertisement (visible only in admin)."
          />
        </div>
      </div>
    </div>
  );
}

