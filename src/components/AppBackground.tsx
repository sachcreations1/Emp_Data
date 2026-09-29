'use client';

import { useEffect, useState } from 'react';
import { getTemplateFile } from '@/lib/idb';

const BACKGROUND_UPDATED_EVENT = 'stafflink-background-updated';

export default function AppBackground() {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isActive = true;

    const loadBackground = async () => {
      const file = await getTemplateFile('app-background');
      if (!isActive) return;

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = file ? URL.createObjectURL(file) : null;
      setBackgroundUrl(objectUrl);
    };

    const handleBackgroundUpdated = () => {
      loadBackground().catch(error => console.error('Failed to update app background', error));
    };

    loadBackground().catch(error => console.error('Failed to load app background', error));
    window.addEventListener(BACKGROUND_UPDATED_EVENT, handleBackgroundUpdated);

    return () => {
      isActive = false;
      window.removeEventListener(BACKGROUND_UPDATED_EVENT, handleBackgroundUpdated);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
      style={backgroundUrl ? {
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.72), rgba(248, 250, 252, 0.72)), url("${backgroundUrl}")`,
      } : undefined}
    />
  );
}