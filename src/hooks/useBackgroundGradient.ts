'use client';

import { usePathname } from 'next/navigation';
import { BACKGROUND_GRADIENTS } from '../constants/theme';

export const useBackgroundGradient = () => {
  const pathname = usePathname();

  // Remove locale prefix from pathname for route matching
  const path = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');

  if (path.startsWith('/projects')) return BACKGROUND_GRADIENTS.projects;
  if (path.startsWith('/music')) return BACKGROUND_GRADIENTS.music;
  if (path.startsWith('/about')) return BACKGROUND_GRADIENTS.about;
  if (path.startsWith('/contact')) return BACKGROUND_GRADIENTS.contact;

  return BACKGROUND_GRADIENTS.home;
};
