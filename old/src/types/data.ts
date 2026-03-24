import { PersonalInfo, EducationItem, ProfessionalSummary, Statistics } from './personal';
import { Project } from './project';
import { CoreSkills, TechnicalSkillsMatrix } from './skills';

export interface PortfolioData {
  readonly personal_info: PersonalInfo;
  readonly education: {
    readonly current: EducationItem;
    readonly previous: readonly EducationItem[];
  };
  readonly professional_summary: ProfessionalSummary;
  readonly featured_projects: readonly Project[];
  readonly additional_projects: readonly Project[];
  readonly core_skills: CoreSkills;
  readonly statistics: Statistics;
  readonly technical_skills_matrix: TechnicalSkillsMatrix;
}
