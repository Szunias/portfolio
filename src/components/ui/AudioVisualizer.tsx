import { useEffect, useRef } from 'react';

const AudioVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Configuration
      const barCount = 60; // Number of bars
      const center = width / 2;
      const maxBarHeight = height * 0.4; // Max height relative to container
      
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'; // text-accent color with opacity

      for (let i = 0; i < barCount; i++) {
        // Generate noise-like value using combined sine waves
        // Different frequencies create a "random" but smooth look
        const noise = 
            Math.sin(time * 2 + i * 0.2) * 0.5 + 
            Math.sin(time * 1 + i * 0.1) * 0.3 +
            Math.sin(time * 4 + i * 0.5) * 0.2;
        
        // Normalize to 0-1 range approximately, but keep it dynamic
        const magnitude = Math.abs(noise); 
        
        // Calculate bar height
        const barHeight = magnitude * maxBarHeight * 0.8 + 10;
        
        const barWidth = 4;
        const gap = 6;
        const totalWidth = barCount * (barWidth + gap);
        const startX = center - totalWidth / 2;
        
        const x = startX + i * (barWidth + gap);
        const y = height / 2 - barHeight / 2; // Centered vertically

        // Draw rounded pill
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 20);
        } else {
          // Fallback for older browsers
          const radius = Math.min(barWidth / 2, barHeight / 2, 20);
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + barHeight - radius);
          ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          ctx.lineTo(x + radius, y + barHeight);
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.fill();
      }

      time += 0.02; // Speed of animation
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full opacity-50 mask-image:linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
      style={{ 
        maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
      }}
    />
  );
};

export default AudioVisualizer;
