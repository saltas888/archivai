"use client";

async function getUserSettings() {
  const response = await fetch('/api/settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return children;
}