export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface CoreSkills {
  [key: string]: SkillCategory;
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
