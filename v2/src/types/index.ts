export interface Project {
  id: string;
  title: string;
  category: string;
  tags: string[];
  thumbnail: string;
  video?: string;
  year: number;
  featured: boolean;
  links?: {
    demo?: string;
    github?: string;
    itch?: string;
  };
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  type: string;
  tags: string[];
  duration: string;
  year: number;
}

export interface Skill {
  name: string;
  icon: string;
  category: string;
  level: 'expert' | 'advanced' | 'intermediate';
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
  location: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface NavItem {
  key: string;
  href: string;
}
