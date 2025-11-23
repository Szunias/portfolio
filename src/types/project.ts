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
