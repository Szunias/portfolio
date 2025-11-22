import { useEffect, useRef } from 'react';

const AudioWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      const centerY = canvas.height / 2;
      
      // Configuration for waves
      // Color: Sky Blue (accent) #38bdf8 -> rgb(56, 189, 248)
      // We use stroke now, so we can afford slightly higher opacity
      const waves = [
        { amplitude: 50, frequency: 0.01, speed: 0.02, color: 'rgba(56, 189, 248, 0.3)' },
        { amplitude: 70, frequency: 0.008, speed: 0.015, color: 'rgba(56, 189, 248, 0.2)' },
        { amplitude: 30, frequency: 0.02, speed: 0.03, color: 'rgba(201, 169, 97, 0.2)' }, // Gold hint
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < canvas.width; x++) {
          // Sine wave equation: y = A * sin(B * x + C)
          const y = centerY + 
            Math.sin(x * wave.frequency + time * wave.speed * 100) * wave.amplitude * 
            Math.sin(time * 0.5 + x * 0.001); 

          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 blur-xl"
    />
  );
};

export default AudioWave;