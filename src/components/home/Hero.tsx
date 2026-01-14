import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const Hero = () => {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [distance, setDistance] = useState(0);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!discRef.current) return;
      
      const rect = discRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Distance from center (for membrane pulse)
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(window.innerWidth, window.innerHeight);
      setDistance(Math.min(dist / maxDist, 1));
      
      // INVERSE rotation - look away from mouse
      const angleX = (e.clientY - centerY) / 8;
      const angleY = (e.clientX - centerX) / 8;
      
      setRotation({ x: angleX, y: -angleY }); // inverted
    };
    
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#0a0a12] opacity-50" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - Typography */}
          <div className="relative">
            
            {/* Vertical accent line */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -left-6 top-0 w-[2px] bg-gradient-to-b from-accent via-accent/50 to-transparent hidden lg:block"
            />

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-8 h-[1px] bg-accent" />
              <span className="text-accent text-xs font-mono uppercase tracking-widest">
                Game Audio
              </span>
            </motion.div>

            {/* AUDIO */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1 className="font-display font-black text-[4rem] sm:text-[6rem] lg:text-[7rem] xl:text-[8rem] leading-[0.85] tracking-tight text-white">
                AUDIO
              </h1>
            </motion.div>

            {/* DESIGN */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <h1 className="font-display font-black text-[4rem] sm:text-[6rem] lg:text-[7rem] xl:text-[8rem] leading-[0.85] tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-sky-300 to-accent">
                  DESIGN
                </span>
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-1 bg-gradient-to-r from-accent to-transparent origin-left mt-2"
              />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 text-dim text-base sm:text-lg leading-relaxed max-w-md"
            >
              {t('hero.description_tech', 'Wwise & FMOD implementation. C++ audio systems. MetaSounds procedural audio.')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link 
                to="/projects" 
                className="group inline-flex items-center gap-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent text-accent px-6 py-3 font-medium transition-all duration-300"
              >
                <span>{t('hero.view_work', 'Explore Projects')}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a 
                href="/cv/Igor_Szuniewicz_CV.pdf" 
                target="_blank"
                className="inline-flex items-center gap-3 border border-white/10 hover:border-white/30 text-dim hover:text-white px-6 py-3 font-medium transition-all duration-300"
              >
                <Download size={16} />
                <span>{t('hero_cv_button', 'CV / Resume')}</span>
              </a>
            </motion.div>
          </div>

          {/* Right - Interactive Speaker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
            ref={discRef}
          >
            <div 
              className="relative w-80 h-80 xl:w-[400px] xl:h-[400px]"
              style={{ perspective: '800px' }}
            >
              {/* Speaker housing */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#151515] to-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  rotateX: rotation.x,
                  rotateY: rotation.y,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
              >
                {/* Speaker grille pattern */}
                <div 
                  className="absolute inset-4 rounded-2xl opacity-30"
                  style={{
                    backgroundImage: `radial-gradient(circle at center, transparent 1px, rgba(255,255,255,0.03) 1px)`,
                    backgroundSize: '8px 8px',
                  }}
                />

                {/* Main speaker cone */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/5">
                  
                  {/* Outer cone ring */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-white/5" />
                  
                  {/* Membrane - pulsates based on mouse distance */}
                  <motion.div 
                    className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#1d1d1d] via-[#151515] to-[#1d1d1d] border border-white/10"
                    animate={{
                      scale: 1 + distance * 0.15,
                    }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                  >
                    {/* Membrane ridges */}
                    <div className="absolute inset-[10%] rounded-full border border-white/[0.03]" />
                    <div className="absolute inset-[25%] rounded-full border border-white/[0.03]" />
                    <div className="absolute inset-[40%] rounded-full border border-white/[0.03]" />
                    
                    {/* Dust cap (center) - also reacts */}
                    <motion.div 
                      className="absolute inset-[35%] rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
                      animate={{
                        scale: 1 + distance * 0.25,
                        boxShadow: `0 0 ${30 + distance * 40}px rgba(56,189,248,${0.2 + distance * 0.3})`,
                      }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    >
                      {/* Inner glow point */}
                      <motion.div 
                        className="absolute inset-[30%] rounded-full bg-accent/40"
                        animate={{
                          opacity: 0.4 + distance * 0.6,
                          scale: 1 + distance * 0.3,
                        }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Corner screws */}
                {[
                  { top: '12px', left: '12px' },
                  { top: '12px', right: '12px' },
                  { bottom: '12px', left: '12px' },
                  { bottom: '12px', right: '12px' },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-[#0a0a0a] border border-white/10"
                    style={pos}
                  >
                    <div className="absolute inset-[30%] rounded-full bg-white/10" />
                  </div>
                ))}

                {/* Reflection */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
              </motion.div>

              {/* Floating tech labels */}
              {['Wwise', 'FMOD', 'UE5', 'C++'].map((tech, i) => {
                const positions = [
                  { top: '-20px', left: '20%' },
                  { top: '30%', right: '-60px' },
                  { bottom: '-20px', right: '20%' },
                  { top: '60%', left: '-50px' },
                ];
                return (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="absolute px-3 py-1.5 bg-primary/90 border border-white/10 hover:border-accent/50 rounded text-xs font-mono text-dim hover:text-accent transition-colors cursor-default backdrop-blur-sm"
                    style={positions[i]}
                  >
                    {tech}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono text-dim uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-8 bg-gradient-to-b from-accent/50 to-transparent"
        />
      </motion.div>

    </section>
  );
};

export default Hero;
