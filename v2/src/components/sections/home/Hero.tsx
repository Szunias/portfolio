'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';

const techBadges = ['Wwise', 'FMOD', 'Unreal Engine', 'C++', 'Reaper'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Hero() {
  const t = useTranslations('hero');
  const tCommon = useTranslations('status');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px),
                             linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Status badge */}
          <motion.div variants={itemVariants}>
            <Badge variant="accent" className="mb-6">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {tCommon('available')}
            </Badge>
          </motion.div>

          {/* Greeting */}
          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-lg md:text-xl mb-2"
          >
            {t('greeting')}
          </motion.p>

          {/* Name */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-4"
          >
            {t('name').split(' ').map((word, i) => (
              <span key={i}>
                {i === 1 ? (
                  <span className="text-gradient">{word}</span>
                ) : (
                  word
                )}{' '}
              </span>
            ))}
          </motion.h1>

          {/* Role */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl lg:text-4xl font-display text-text-secondary mb-6"
          >
            {t('role')}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8 leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* Tech badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-10">
            {techBadges.map((tech) => (
              <Badge key={tech} variant="outline" size="sm">
                {tech}
              </Badge>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/projects">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {t('cta.primary')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                {t('cta.secondary')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-1"
        >
          <motion.div className="w-1.5 h-1.5 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
