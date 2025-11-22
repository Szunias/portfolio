import portfolioData from '../data/portfolioData.json';
import { PortfolioData } from '../types';

// In a real app, this might use useEffect to fetch data,
// but for a static portfolio, importing JSON directly is most efficient.
export const usePortfolioData = (): PortfolioData => {
  return portfolioData as unknown as PortfolioData;
};
