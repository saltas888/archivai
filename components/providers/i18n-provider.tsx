"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import i18next from '@/lib/i18n/config';

async function getUserSettings() {
  const response = await fetch('/api/settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getUserSettings,
  });

  return children;
}