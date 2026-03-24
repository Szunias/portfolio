export interface TechCategory {
  readonly id: string;
  readonly titleKey: string;
  readonly subtitleKey: string;
  readonly accentColor: string;
  readonly items: readonly string[];
}
