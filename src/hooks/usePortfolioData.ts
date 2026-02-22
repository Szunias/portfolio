import type { PortfolioData } from '../types';
import portfolioData from '../data/portfolioData.json';

/**
 * Provides typed access to the static portfolio data (projects, personal info, skills).
 * Uses a double cast because the JSON import type doesn't match the PortfolioData interface.
 */
export const usePortfolioData = (): PortfolioData => {
  return portfolioData as unknown as PortfolioData;
};
