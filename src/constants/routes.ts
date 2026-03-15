export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:id',
  GRADWORK: '/projects/gradwork',
  TRANSIENTICA: '/projects/transientica_audiolab',
  SOUND_DESIGN: '/projects/sound-design',
  SHADOW_FRAMES: '/projects/shadow_frames',
  MIDDLEWARE_OPTIMIZATION: '/projects/middleware-optimization',
  MUSIC: '/music',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

export type RouteKey = keyof typeof ROUTES;
