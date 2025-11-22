export interface PersonalInfo {
  name: string;
  title: string;
  role: string;
  email: string;
  location: {
    city: string;
    country: string;
    region: string;
  };
  availability: {
    status: string;
    period: string;
    duration: string;
    passport: string;
    relocation: string;
    remote: string;
  };
  languages: string[];
  social_media: {
    github: string;
    linkedin: string;
    spotify: string;
    itch_io: string;
    website: string;
  };
}

export interface EducationItem {
  institution: string;
  location: string;
  program: string;
  status: string;
  specialization?: string;
  focus?: string;
  started_age?: number;
  description?: string;
}

export interface ProfessionalSummary {
  tagline: string;
  short_bio: string;
  extended_bio: string;
}

export interface CodeSnippet {
  title: string;
  language: string; // e.g., 'cpp', 'python'
  code: string;
  description?: string;
}

export type ContentBlockType = 'text' | 'image' | 'video' | 'split_text_media' | 'stats_grid' | 'code';

export interface ContentBlock {
  type: ContentBlockType;
  title?: string;
  content?: string; // Markdown supported
  media?: string; // Path to image/video
  mediaCaption?: string;
  reverseLayout?: boolean; // For split blocks: media left or right
  items?: { label: string; value: string }[]; // For stats grid
  codeLanguage?: string; // For code blocks
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  sources: { url: string; type: string }[];
  desc: { [key: string]: string };
  tags: string[];
  length: number;
}

export interface Project {
  id: string;
  title: string;
  category: string; // e.g., "Sound Design", "Music", "Programming"
  year?: string;
  short_description: string;
  full_description?: string;
  content_blocks?: ContentBlock[];
  tags: string[];
  technologies: string[];
  links: {
    demo?: string;
    repo?: string;
    video?: string;
    documentation?: string;
  };
  media: {
    thumbnail: string;
    images?: string[];
    video?: string;
    audio?: string; // Path to audio file if applicable
  };
  code_snippets?: CodeSnippet[];
  externalLink?: string;
  featured: boolean;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface CoreSkills {
  [key: string]: SkillCategory;
}

export interface Statistics {
  years_of_music: string;
  completed_projects: string;
  tools_built: string;
  ml_audio_latency: string;
}

export interface TechTool {
  level: string;
  description?: string;
  desc?: string;
  rich_descriptions?: { [key: string]: string };
}

export interface TechCategory {
  category: string;
  tools: { [key: string]: TechTool };
}

export interface TechnicalSkillsMatrix {
  [key: string]: TechCategory;
}

export interface PortfolioData {
  personal_info: PersonalInfo;
  education: {
    current: EducationItem;
    previous: EducationItem[];
  };
  professional_summary: ProfessionalSummary;
  featured_projects: Project[];
  additional_projects: Project[];
  core_skills: CoreSkills;
  statistics: Statistics;
  technical_skills_matrix: TechnicalSkillsMatrix;
}
