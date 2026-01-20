import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef, memo } from 'react';

interface Shape {
  id: number;
  type: 'triangle' | 'square' | 'circle' | 'hexagon' | 'diamond';
  size: number;
  color: string;
  depth: number;
  baseRotation: number;
  rotationMode: 'normal' | 'inverted' | 'xOnly' | 'yOnly' | 'diagonal' | 'counter';
}

const shapes: Shape[] = [
  { id: 1, type: 'circle', size: 320, color: '#1e3a5f', depth: 0, baseRotation: 0, rotationMode: 'xOnly' },
  { id: 2, type: 'hexagon', size: 280, color: '#3b1f5b', depth: 1, baseRotation: 30, rotationMode: 'inverted' },
  { id: 3, type: 'square', size: 220, color: '#1e4d4d', depth: 2, baseRotation: 45, rotationMode: 'diagonal' },
  { id: 4, type: 'triangle', size: 180, color: '#4a1942', depth: 3, baseRotation: 0, rotationMode: 'yOnly' },
  { id: 5, type: 'diamond', size: 140, color: '#38bdf8', depth: 4, baseRotation: 0, rotationMode: 'counter' },
  { id: 6, type: 'circle', size: 80, color: '#a855f7', depth: 5, baseRotation: 0, rotationMode: 'normal' },
];

const ShapeComponent = ({
  shape,
  mousePos,
  containerCenter,
  isInRange
}: {
  shape: Shape;
  mousePos: { x: number; y: number };
  containerCenter: { x: number; y: number };
  isInRange: boolean;
}) => {
  // Derive rotation directly from props using useMemo
  const rotation = useMemo(() => {
    // Return neutral if not in range
    if (!isInRange) {
      return { x: 0, y: 0 };
    }

    const deltaX = mousePos.x - containerCenter.x;
    const deltaY = mousePos.y - containerCenter.y;

    const depthScale = 1 + shape.depth * 0.25;
    const maxRotation = 45;

    let rotateX = 0;
    let rotateY = 0;

    switch (shape.rotationMode) {
      case 'normal':
        rotateY = (deltaX / 8) * depthScale;
        rotateX = (-deltaY / 8) * depthScale;
        break;
      case 'inverted':
        rotateY = (-deltaX / 10) * depthScale;
        rotateX = (deltaY / 10) * depthScale;
        break;
      case 'xOnly':
        rotateX = (-deltaY / 6) * depthScale;
        rotateY = 0;
        break;
      case 'yOnly':
        rotateX = 0;
        rotateY = (deltaX / 6) * depthScale;
        break;
      case 'diagonal':
        rotateY = (-deltaY / 8) * depthScale;
        rotateX = (-deltaX / 8) * depthScale;
        break;
      case 'counter':
        rotateY = (-deltaX / 6) * depthScale;
        rotateX = (deltaY / 6) * depthScale;
        break;
    }

    rotateX = Math.max(-maxRotation, Math.min(maxRotation, rotateX));
    rotateY = Math.max(-maxRotation, Math.min(maxRotation, rotateY));

    return { x: rotateX, y: rotateY };
  }, [mousePos, containerCenter, shape.depth, shape.rotationMode, isInRange]);

  const renderShape = () => {
    switch (shape.type) {
      case 'triangle':
        return (
          <div 
            className="w-full h-full"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              border: `2px solid ${shape.color}`,
              backgroundColor: `${shape.color}15`,
            }}
          />
        );
      case 'square':
        return (
          <div 
            className="w-full h-full"
            style={{
              border: `2px solid ${shape.color}`,
              backgroundColor: `${shape.color}10`,
            }}
          />
        );
      case 'circle':
        return (
          <div 
            className="w-full h-full rounded-full"
            style={{
              border: `2px solid ${shape.color}`,
              backgroundColor: `${shape.color}08`,
            }}
          />
        );
      case 'hexagon':
        return (
          <div 
            className="w-full h-full"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              border: `2px solid ${shape.color}`,
              backgroundColor: `${shape.color}12`,
            }}
          />
        );
      case 'diamond':
        return (
          <div 
            className="w-full h-full"
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              border: `2px solid ${shape.color}`,
              backgroundColor: `${shape.color}20`,
              boxShadow: `0 0 60px ${shape.color}40`,
            }}
          />
        );
    }
  };

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 scale-50 sm:scale-60 lg:scale-100"
      style={{
        width: shape.size,
        height: shape.size,
        marginLeft: -shape.size / 2,
        marginTop: -shape.size / 2,
        zIndex: shape.depth,
        perspective: '1000px',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.1 + shape.depth * 0.15, ease: "easeOut" }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotate(${shape.baseRotation}deg)`,
        }}
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 80 }}
      >
        {renderShape()}
      </motion.div>
    </motion.div>
  );
};

// Memoize ShapeComponent to prevent unnecessary re-renders
const MemoizedShapeComponent = memo(ShapeComponent);

const Hero = () => {
  const { t } = useTranslation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const [isInRange, setIsInRange] = useState(false);
  const shapesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCenter = () => {
      if (shapesContainerRef.current) {
        const rect = shapesContainerRef.current.getBoundingClientRect();
        setContainerCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };
    
    updateCenter();
    window.addEventListener('resize', updateCenter);
    window.addEventListener('scroll', updateCenter);
    
    return () => {
      window.removeEventListener('resize', updateCenter);
      window.removeEventListener('scroll', updateCenter);
    };
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const dx = e.clientX - containerCenter.x;
      const dy = e.clientY - containerCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setIsInRange(distance < 400);
    };

    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        setMousePos({ x: touch.clientX, y: touch.clientY });
        const dx = touch.clientX - containerCenter.x;
        const dy = touch.clientY - containerCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        setIsInRange(distance < 400);
      }
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [containerCenter]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left - Typography */}
          <div className="relative">
            
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -left-6 top-0 w-[2px] bg-gradient-to-b from-accent via-accent/50 to-transparent hidden lg:block"
            />

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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1 className="font-display font-black text-[4rem] sm:text-[6rem] lg:text-[7rem] xl:text-[8rem] leading-[0.85] tracking-tight text-white">
                AUDIO
              </h1>
            </motion.div>

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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 text-dim text-base sm:text-lg leading-relaxed max-w-md"
            >
              {t('hero.description_tech', 'Wwise & FMOD implementation. C++ audio systems. MetaSounds procedural audio.')}
            </motion.p>

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

          {/* Right - Layered 3D Shapes */}
          <div
            ref={shapesContainerRef}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            {shapes.map((shape) => (
              <MemoizedShapeComponent
                key={shape.id}
                shape={shape}
                mousePos={mousePos}
                containerCenter={containerCenter}
                isInRange={isInRange}
              />
            ))}
          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;
