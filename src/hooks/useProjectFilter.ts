import { useState, useMemo } from 'react';
import { Project } from '../types';
import { useTranslation } from 'react-i18next';

export const useProjectFilter = (projects: Project[]) => {
  const { t } = useTranslation();
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
  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return t('projects_filter_all', 'All');
    if (cat === 'Game Audio') return t('projects_filter_game', cat);
    if (cat === 'Sound Design') return t('projects_filter_sound', cat);
    if (cat === 'Music') return t('projects_filter_music', cat);
    if (cat === 'Development') return t('projects_filter_tools', cat);
    return cat;
  };

  return {
    filter,
    setFilter,
    categories,
    filteredProjects,
    getCategoryLabel
  };
};
