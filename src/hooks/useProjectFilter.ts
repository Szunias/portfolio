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
    
    // Map specific categories to translation keys
    const keyMap: { [key: string]: string } = {
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

    if (keyMap[cat]) {
        return t(keyMap[cat], cat);
    }
    
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
