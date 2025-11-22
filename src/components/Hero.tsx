import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, ArrowRight, Terminal, Cpu, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]); // Slower fade out

  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-12 overflow-hidden bg-[#050505] pt-20">
      
      {/* Background: Technical Grid & Noise */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
        
        {/* Floating Tech Logos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Wwise - Top Right */}
            <motion.img 
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 0.08, rotate: 0, y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                src="/assets/images/tech-bg/wwise.png" 
                className="absolute top-[10%] right-[5%] w-64 md:w-96 filter grayscale brightness-200 blur-[2px]"
            />
            
            {/* FMOD - Bottom Left */}
            <motion.img 
                initial={{ opacity: 0, rotate: 5 }}
                animate={{ opacity: 0.05, rotate: 0, y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                src="/assets/images/tech-bg/fmod.jpg" 
                className="absolute bottom-[20%] left-[-5%] w-80 md:w-[500px] opacity-10 mix-blend-screen blur-[1px]"
            />

            {/* Unreal - Top Left Center */}
            <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06, scale: [1, 1.1, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                src="/assets/images/tech-bg/unreal.png" 
                className="absolute top-[15%] left-[20%] w-40 md:w-64 filter invert blur-[1px]"
            />

            {/* Unity - Bottom Right Center (With white glow/bg for visibility) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.08, y: [0, -15, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[30%] right-[25%] w-32 md:w-48 aspect-square bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
                <img 
                    src="/assets/images/tech-bg/unity.png" 
                    className="w-[70%] opacity-80"
                />
            </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left: Content */}
        <motion.div 
          style={{ y, opacity }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          {/* Status Line */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-accent uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              {t('hero.status', 'System Active')}
            </div>
            <div className="h-px w-12 bg-white/10"></div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Igorszuniewicz.com <span className="text-white/20 mx-2">//</span> v2.5
            </span>
          </div>

          {/* Brutalist Headline */}
          <h1 className="font-display font-bold text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white mb-8 tracking-tighter">
            {t('hero.headline_main', 'TECHNICAL')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-600">
              {t('hero.headline_sub', 'AUDIO DESIGN')}
            </span>
          </h1>

          {/* Technical Sub-headline */}
          <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed font-light border-l border-accent/30 pl-6">
            {t('hero.description_tech', 'Bridging the void between artistic vision and engine logic. Specializing in Wwise & FMOD implementation, C++ DSP, and adaptive audio systems.')}
          </p>
          
          {/* Tech Stack Mini-Grid */}
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-md">
            {[
              { label: t('tech_cat.Audio Middleware', 'Middleware'), val: 'Wwise / FMOD', icon: Layers },
              { label: t('tech_cat.Game Engines', 'Engine'), val: 'Unreal / Unity', icon: Cpu },
              { label: t('tech_cat.Programming', 'Scripting'), val: 'C++ / Python', icon: Terminal },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <item.icon size={12} />
                  <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors">
                  {item.val}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons - Modern Sharp */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              to="/projects"
              className="group relative px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center overflow-hidden transition-all hover:bg-accent"
            >
              <span className="relative z-10 flex items-center">
                {t('hero.view_work', 'Explore Projects')}
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <a 
              href="/cv/Igor_Szuniewicz_CV.pdf" 
              target="_blank"
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-medium text-sm uppercase tracking-wider flex items-center justify-center hover:bg-white/5 transition-all"
            >
              <Download size={16} className="mr-2" />
              CV / Resumé
            </a>
          </div>
        </motion.div>

        {/* Right: Abstract Tech Visualization */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="hidden lg:block lg:col-span-5 relative"
        >
          {/* Abstract Card Container */}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            
            {/* Rotating Rings (Abstract Speaker/Radar) */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-[10%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="absolute inset-[20%] border border-dashed border-accent/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
            
            {/* Central "Core" */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-black rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-accent/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/10 blur-xl group-hover:bg-accent/20 transition-all"></div>
                    <Cpu size={48} className="text-white/80 relative z-10" />
                </div>
            </div>

            {/* Floating Data Points */}
            <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] right-[10%] bg-[#0f0f0f] border border-white/10 p-4 rounded-lg shadow-xl backdrop-blur-md"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-mono text-slate-400">RTPC_Intensity</span>
                </div>
                <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        animate={{ width: ["0%", "80%", "40%", "90%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-full bg-green-500"
                    />
                </div>
            </motion.div>

            <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] left-[0%] bg-[#0f0f0f] border border-white/10 p-4 rounded-lg shadow-xl backdrop-blur-md"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-[10px] font-mono text-slate-400">Wwise_Event_Fire</span>
                </div>
                <div className="font-mono text-xs text-accent">PostEvent(ID, Actor)</div>
            </motion.div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Fade to Black (Seamless Transition) */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none z-30"></div>
    </section>
  );
};

export default Hero;