export interface CodeAnnotation {
  readonly line: number;
  readonly label: string;
  readonly explanation: string;
}

export interface ProjectImage {
  readonly src: string;
  readonly caption: string;
}

export interface CodeSnippet {
  readonly title: string;
  readonly language: string;
  readonly code: string;
  readonly description?: string;
  readonly annotations?: readonly CodeAnnotation[];
}

export type ContentBlockType = 'text' | 'image' | 'video' | 'split_text_media' | 'stats_grid' | 'code';

export interface StatsGridItem {
  readonly label: string;
  readonly value: string;
}

export interface ContentBlock {
  readonly type: ContentBlockType;
  readonly title?: string;
  readonly content?: string;
  readonly media?: string;
  readonly mediaCaption?: string;
  readonly reverseLayout?: boolean;
  readonly items?: readonly StatsGridItem[];
  readonly codeLanguage?: string;
}

export interface ChallengeSolved {
  readonly challenge: string;
  readonly problem: string;
  readonly solution: string;
}

export interface Project {
  readonly id: string;
  readonly i18nNamespace?: string;
  readonly title: string;
  readonly category: string;
  readonly year?: number;
  readonly description?: string;
  readonly short_description?: string;
  readonly full_description?: string;
  readonly content_blocks?: readonly ContentBlock[];
  readonly tags: readonly string[];
  readonly technologies?: readonly string[];
  readonly links?: {
    readonly demo?: string;
    readonly repo?: string;
    readonly video?: string;
    readonly video_legacy?: string;
    readonly documentation?: string;
  };
  readonly media: {
    readonly thumbnail: string;
    readonly images?: readonly (string | ProjectImage)[];
    readonly video?: string;
    readonly video_legacy?: string;
    readonly audio?: string;
  };
  readonly code_snippets?: readonly CodeSnippet[];
  readonly challenges_solved?: readonly ChallengeSolved[];
  readonly responsibilities?: readonly string[];
  readonly technical_stack?: Readonly<Record<string, string>>;
  readonly performance_metrics?: Readonly<Record<string, string>>;
  readonly technical_achievements?: Readonly<Record<string, string>>;
  readonly audio_systems?: Readonly<Record<string, string>>;
  readonly team_size?: number;
  readonly engine?: string;
  readonly platforms?: readonly string[];
  readonly collaboration?: string;
  readonly key_scenes?: readonly string[];
  readonly audio_design?: Readonly<Record<string, string>>;
  readonly technical_work?: Readonly<Record<string, string>>;
  readonly externalLink?: string;
  readonly featured?: boolean;
}
