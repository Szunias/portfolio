'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { GraduationCap, Lightbulb, Users, BookOpen, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const iconMap: Record<string, React.ElementType> = {
  0: Lightbulb,
  1: BookOpen,
  2: Users,
  3: GraduationCap,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  const t = useTranslations('about');

  const educationItems = [
    {
      institution: 'Howest University of Applied Sciences',
      degree: "Bachelor's Degree",
      field: 'Digital Arts & Entertainment - Game Audio',
      period: '2023 - Present',
      location: 'Kortrijk, Belgium',
      current: true,
    },
    {
      institution: 'I LO im. T. Kosciuszki',
      degree: 'High School Diploma',
      field: 'General Education',
      period: '2019 - 2023',
      location: 'Legnica, Poland',
      current: false,
    },
  ];

  const philosophyPrinciples = [
    {
      title: t('philosophy.principles.0.title'),
      description: t('philosophy.principles.0.description'),
    },
    {
      title: t('philosophy.principles.1.title'),
      description: t('philosophy.principles.1.description'),
    },
    {
      title: t('philosophy.principles.2.title'),
      description: t('philosophy.principles.2.description'),
    },
    {
      title: t('philosophy.principles.3.title'),
      description: t('philosophy.principles.3.description'),
    },
  ];

  const languages = [
    { name: 'Polish', level: t('languages.items.0.level') },
    { name: 'English', level: t('languages.items.1.level') },
    { name: 'Dutch', level: t('languages.items.2.level') },
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              {t('intro.title')}
            </h1>
            <p className="text-xl text-text-secondary">{t('intro.subtitle')}</p>
          </motion.div>

          {/* Bio section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-6">
                {t('bio.title')}
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>{t('bio.paragraphs.0')}</p>
                <p>{t('bio.paragraphs.1')}</p>
                <p>{t('bio.paragraphs.2')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-elevated border border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  {/* Profile image placeholder */}
                  <span className="text-6xl">👨‍💻</span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Education Timeline */}
      <section className="py-16 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-semibold text-center mb-12"
          >
            {t('education.title')}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            {educationItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* Timeline line */}
                {index < educationItems.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                )}

                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.current
                      ? 'border-accent bg-accent/20'
                      : 'border-border bg-surface'
                  }`}
                >
                  {item.current && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                </div>

                <Card className="ml-4">
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.institution}</h3>
                      {item.current && (
                        <Badge variant="accent" size="sm">
                          {t('education.current')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-accent font-medium mb-1">{item.degree}</p>
                    <p className="text-text-secondary text-sm mb-2">{item.field}</p>
                    <div className="flex items-center gap-4 text-text-muted text-sm">
                      <span>{item.period}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-semibold text-center mb-12"
          >
            {t('philosophy.title')}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {philosophyPrinciples.map((principle, index) => {
              const Icon = iconMap[index] || Lightbulb;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card hover className="h-full">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{principle.title}</h3>
                      <p className="text-text-secondary">{principle.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-16 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-semibold text-center mb-12"
          >
            {t('languages.title')}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6"
          >
            {languages.map((lang, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="px-8 py-6 text-center">
                  <Globe className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{lang.name}</h3>
                  <p className="text-text-secondary text-sm">{lang.level}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
