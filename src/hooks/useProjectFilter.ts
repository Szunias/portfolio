import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { Project } from '../types';

// Static translation map
const KEY_MAP: { [key: string]: string } = {
  'Game Audio': 'projects_filter_game',
  'Sound Design': 'projects_filter_sound',
  'Music': 'projects_filter_music',
  'Dev Tool': 'projects_filter_tools',
  'In Progress': 'projects_filter_inprogress',
  'Research': 'projects_filter_research',
  'ML Audio': 'projects_filter_ml',
  'VST Plugin': 'projects_filter_vst',
  'Middleware': 'projects_filter_middleware',
  'Horror Game': 'projects_filter_horror',
  'Animation': 'projects_filter_animation',
  'Film Score': 'projects_filter_filmscore'
};

interface UseProjectFilterResult {
  filter: string;
  setFilter: (filter: string) => void;
  categories: string[];
  filteredProjects: readonly Project[];
  getCategoryLabel: (cat: string) => string;
}

/**
 * Manages category filtering for the projects page.
 * Extracts unique categories, filters projects by the active category,
 * and translates category labels via i18n.
 * @param projects - Full list of projects to filter
 */
export const useProjectFilter = (projects: readonly Project[]): UseProjectFilterResult => {
  const { t } = useTranslation('projects');
  const [filter, setFilter] = useState('All');

  // Extract unique categories
  const categories = useMemo(() => 
    ['All', ...new Set(projects.map(p => p.category))],
    [projects]
  );

  const filteredProjects = useMemo(() => 
    filter === 'All' ? projects : projects.filter(p => p.category === filter),
    [filter, projects]
  );

  // Helper to translate category names
  const getCategoryLabel = useCallback((cat: string) => {
    if (cat === 'All') return t('projects_filter_all', 'All');

    if (KEY_MAP[cat]) {
        return t(KEY_MAP[cat], cat);
    }

    if (import.meta.env.DEV) {
      console.warn(`[useProjectFilter] Unmapped category "${cat}" — add it to KEY_MAP for i18n support`);
    }
    return cat;
  }, [t]);

  return {
    filter,
    setFilter,
    categories,
    filteredProjects,
    getCategoryLabel
  };
};
