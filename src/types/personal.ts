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

export interface Statistics {
  years_of_music: string;
  completed_projects: string;
  tools_built: string;
  ml_audio_latency: string;
}
