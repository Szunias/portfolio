import { BADGE_COLORS } from '../constants/theme';

export const getBadgeStyle = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('game') || c.includes('horror')) return BADGE_COLORS.game;
  if (c.includes('tool') || c.includes('plugin') || c.includes('dev')) return BADGE_COLORS.tool;
  if (c.includes('music')) return BADGE_COLORS.music;
  if (c.includes('sound')) return BADGE_COLORS.sound;
  return BADGE_COLORS.default;
};
