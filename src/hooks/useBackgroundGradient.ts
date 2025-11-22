import { useLocation } from 'react-router-dom';
import { BACKGROUND_GRADIENTS } from '../constants/theme';

export const useBackgroundGradient = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/projects')) return BACKGROUND_GRADIENTS.projects;
  if (path.startsWith('/music')) return BACKGROUND_GRADIENTS.music;
  if (path.startsWith('/about')) return BACKGROUND_GRADIENTS.about;
  if (path.startsWith('/contact')) return BACKGROUND_GRADIENTS.contact;
  
  return BACKGROUND_GRADIENTS.home;
};
