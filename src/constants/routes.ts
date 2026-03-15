export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:id',
  GRADWORK: '/projects/gradwork',
  TRANSIENTICA: '/projects/transientica_audiolab',
  SOUND_DESIGN: '/projects/sound-design',
  SHADOW_FRAMES: '/projects/shadow_frames',
  NOT_TODAY_DARLING: '/projects/not_today_darling',
  AUDIOQ: '/projects/audioq',
  RAY_ANIMATION: '/projects/ray_animation',
  AMORAK: '/projects/amorak',
  MIDDLEWARE_OPTIMIZATION: '/projects/middleware-optimization',
  RICHTER: '/projects/richter',
  AKANTILADO: '/projects/akantilado',
  PAUSE_AND_DESERVE: '/projects/pause_and_deserve',
  WWISE_UNREAL_FIXER: '/projects/wwise_unreal_fixer',
  MUSIC: '/music',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

export type RouteKey = keyof typeof ROUTES;
