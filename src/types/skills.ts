export interface SkillCategory {
  readonly title: string;
  readonly skills: readonly string[];
}

export interface CoreSkills {
  readonly [key: string]: SkillCategory;
}

export interface TechTool {
  readonly level?: string;
  readonly description?: string;
  readonly desc?: string;
  readonly rich_descriptions?: Readonly<Record<string, string>>;
}

export interface SkillsMatrixCategory {
  readonly category: string;
  readonly tools: Readonly<Record<string, TechTool>>;
}

export interface TechnicalSkillsMatrix {
  readonly [key: string]: SkillsMatrixCategory;
}
