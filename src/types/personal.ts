export interface PersonalInfo {
  readonly name: string;
  readonly title: string;
  readonly role: string;
  readonly email: string;
  readonly location: {
    readonly city: string;
    readonly country: string;
    readonly region: string;
  };
  readonly availability: {
    readonly status: string;
    readonly period: string;
    readonly duration: string;
    readonly passport: string;
    readonly relocation: string;
    readonly remote: string;
  };
  readonly languages: readonly string[];
  readonly social_media: {
    readonly github: string;
    readonly linkedin: string;
    readonly spotify: string;
    readonly itch_io: string;
    readonly website: string;
  };
  readonly hero_tech_stack?: readonly string[];
}

export interface EducationItem {
  readonly institution: string;
  readonly location: string;
  readonly program: string;
  readonly status: string;
  readonly specialization?: string;
  readonly focus?: string;
  readonly started_age?: number;
  readonly description?: string;
}

export interface ProfessionalSummary {
  readonly tagline: string;
  readonly short_bio: string;
  readonly extended_bio: string;
}

export interface Statistics {
  readonly years_of_music: string;
  readonly completed_projects: string;
  readonly tools_built: string;
  readonly languages_fluent: number;
  readonly ml_audio_latency: string;
}
