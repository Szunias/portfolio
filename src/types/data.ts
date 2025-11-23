import { PersonalInfo, EducationItem, ProfessionalSummary, Statistics } from './personal';
import { Project } from './project';
import { CoreSkills, TechnicalSkillsMatrix } from './skills';

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
