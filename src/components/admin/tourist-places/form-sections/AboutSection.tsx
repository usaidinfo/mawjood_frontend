'use client';

import { useEffect, useRef, useState } from 'react';
import RichTextEditor from '@/components/dashboard/add-listing/RichTextEditor';

interface AboutSectionProps {
  about: string;
  onAboutChange: (value: string) => void;
}

export function AboutSection({ about, onAboutChange }: AboutSectionProps) {
  const prevAboutRef = useRef<string>('');
  const [editorKey, setEditorKey] = useState(0);

  // Force re-initialization when about content changes from empty to having content (edit mode)
  useEffect(() => {
    const prevAbout = prevAboutRef.current;
    // If we transition from empty to having content, re-initialize the editor
    if (!prevAbout && about) {
      setEditorKey(prev => prev + 1);
    }
    prevAboutRef.current = about;
  }, [about]);

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-xl font-semibold">About</h2>
      <RichTextEditor 
        key={editorKey || 'about-editor'}
        content={about || ''} 
        onChange={onAboutChange} 
        placeholder="Describe the city and its attractions..."
      />
    </div>
  );
}

