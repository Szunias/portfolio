export interface CodeAnnotation {
  line: number;           // Line number (1-indexed)
  label: string;          // Short label shown on hover
  explanation: string;    // Full explanation
}

export interface ProjectImage {
  src: string;
  caption: string;
}

export interface CodeSnippet {
  title: string;
  language: string; // e.g., 'cpp', 'python'
  code: string;
  description?: string;
  annotations?: CodeAnnotation[];  // Interactive annotations for code lines
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
    video_legacy?: string;
    documentation?: string;
  };
  media: {
    thumbnail: string;
    images?: (string | ProjectImage)[];
    video?: string;
    video_legacy?: string;
    audio?: string; // Path to audio file if applicable
  };
  code_snippets?: CodeSnippet[];
  challenges_solved?: {
    challenge: string;
    problem: string;
    solution: string;
  }[];
  responsibilities?: string[];
  technical_stack?: Record<string, string>;
  performance_metrics?: Record<string, string>;
  technical_achievements?: Record<string, string>;
  audio_systems?: Record<string, string>;
  team_size?: number;
  engine?: string;
  platforms?: string[];
  collaboration?: string;
  key_scenes?: string[];
  audio_design?: Record<string, string>;
  technical_work?: Record<string, string>;
  externalLink?: string;
  featured: boolean;
}
