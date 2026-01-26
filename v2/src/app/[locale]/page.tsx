import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/sections/home/Hero';
import FeaturedProjects from '@/components/sections/home/FeaturedProjects';
import SkillsOverview from '@/components/sections/home/SkillsOverview';
import Showreel from '@/components/sections/home/Showreel';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeaturedProjects />
      <SkillsOverview />
      <Showreel />
    </>
  );
}
