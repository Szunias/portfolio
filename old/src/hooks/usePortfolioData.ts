import type { PortfolioData } from '../types';
import portfolioData from '../data/portfolioData.json';

const data = portfolioData as unknown as PortfolioData;

if (import.meta.env.DEV) {
  const requiredTopLevel: (keyof PortfolioData)[] = [
    'personal_info', 'education', 'professional_summary',
    'featured_projects', 'core_skills', 'statistics',
  ];
  for (const key of requiredTopLevel) {
    if (!(key in data)) {
      console.error(`[portfolioData] Missing required top-level field: "${key}"`);
    }
  }
  for (const project of [...data.featured_projects, ...data.additional_projects]) {
    if (!project.id) console.error('[portfolioData] Project missing "id"');
    if (!project.title) console.error(`[portfolioData] Project "${project.id}" missing "title"`);
    if (!project.category) console.error(`[portfolioData] Project "${project.id}" missing "category"`);
    if (!project.media?.thumbnail) console.error(`[portfolioData] Project "${project.id}" missing "media.thumbnail"`);
    if (!project.tags || project.tags.length === 0) console.warn(`[portfolioData] Project "${project.id}" has no tags`);
  }
}

/**
 * Provides typed access to the static portfolio data (projects, personal info, skills).
 * Uses a double cast because the JSON import type doesn't match the PortfolioData interface.
 * In development, validates required fields and logs warnings for missing data.
 */
export const usePortfolioData = (): PortfolioData => {
  return data;
};
