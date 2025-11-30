import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AppStage } from '../types';
import { Undo2, RotateCcw, ArrowRight } from 'lucide-react';

interface ShapingStageProps {
  onComplete: (imageData: string) => void;
}

interface Point {
  x: number;
  y: number;
}

export const ShapingStage: React.FC<ShapingStageProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [history, setHistory] = useState<Point[][]>([]); // Simple undo history

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        drawCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [points]);

  // Main Draw Function (renders everything based on state)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;

    // 1. Clear & Background
    ctx.clearRect(0, 0, w, h);
    
    // Gradient Background to simulate depth (potter's wheel context)
    const gradient = ctx.createRadialGradient(centerX, h/2, 50, centerX, h/2, w);
    gradient.addColorStop(0, '#fafafa');
    gradient.addColorStop(1, '#e5e5e5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Guide Lines (Subtle)
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    
    // Center Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    // Horizontal Guides (Top/Bottom)
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX - 150, 60);
    ctx.lineTo(centerX + 150, 60); // Top Rim limit
    ctx.moveTo(centerX - 100, h - 60);
    ctx.lineTo(centerX + 100, h - 60); // Base limit
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Wheel Base Visualization (Aesthetic anchor)
    ctx.fillStyle = '#b5b3b0';
    ctx.beginPath();
    ctx.ellipse(centerX, h - 50, 120, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(centerX, h - 45, 120, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw The Clay Profile
    if (points.length > 1) {
      // Style settings for the clay
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#574638'; // Dark clay color
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.1)';

      // Helper for smooth curve
      const drawSmoothLine = (pts: Point[], offsetX = 0, scaleX = 1) => {
        ctx.beginPath();
        if (pts.length < 2) return;

        // Move to first point (adjusted)
        let startX = (pts[0].x - centerX) * scaleX + centerX + offsetX;
        ctx.moveTo(startX, pts[0].y);

        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          
          const p1x = (pts[i].x - centerX) * scaleX + centerX + offsetX;
          const p1y = pts[i].y;
          const pcx = (xc - centerX) * scaleX + centerX + offsetX;
          const pcy = yc;

          ctx.quadraticCurveTo(p1x, p1y, pcx, pcy);
        }
        
        // Connect last point
        const last = pts[pts.length - 1];
        const lastX = (last.x - centerX) * scaleX + centerX + offsetX;
        ctx.lineTo(lastX, last.y);
        ctx.stroke();
      };

      // Draw Right Side (User input)
      drawSmoothLine(points, 0, 1);

      // Draw Left Side (Mirror) - opacity slightly lower to indicate it's a reflection
      ctx.strokeStyle = '#574638';
      drawSmoothLine(points, 0, -1);
      
      // Draw Fill (Optional: to make it look solid)
      ctx.fillStyle = 'rgba(168, 162, 158, 0.2)';
      ctx.beginPath();
      // Right side path
      ctx.moveTo(centerX, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
         const xc = (points[i].x + points[i + 1].x) / 2;
         const yc = (points[i].y + points[i + 1].y) / 2;
         ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
      // Connect to mirrored side bottom
      ctx.lineTo(centerX - (points[points.length-1].x - centerX), points[points.length-1].y);
       // Mirror side path backwards? Simplify: just fill manually or ignore for MVP
       // Actually, easier to just stroke for now to keep it clean.
    }

  }, [points]);

  // Effect to trigger redraw when points change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const p = getPoint(e);
    // Only allow starting on the right side of center to avoid confusion
    if (canvasRef.current && p.x < canvasRef.current.width / 2) return;
    
    // Start a new line - reset points for simplicity in this specific "profile" interaction
    // Or do we want continuous drawing? For a pottery profile, usually you draw one continuous line from top to bottom.
    // Let's reset for a cleaner UX: "Draw the profile in one stroke"
    setPoints([p]); 
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const p = getPoint(e);
    
    // Clamp to right side
    if (canvasRef.current && p.x < canvasRef.current.width / 2) {
      p.x = canvasRef.current.width / 2;
    }

    setPoints(prev => [...prev, p]);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Smooth out the array slightly to reduce jitter?
      // The quadratic rendering handles most of it, but we could simplify points here if needed.
    }
  };

  const handleReset = () => {
    setPoints([]);
  };

  const handleFinish = () => {
    if (canvasRef.current) {
      onComplete(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 lg:p-8">
      
      {/* Instructions */}
      <div className="text-center mb-6 space-y-2 animate-fade-in">
        <h2 className="text-3xl font-serif text-stone-900">
          The Shape <span className="text-stone-400 mx-2">|</span> <span className="font-light">拉坯</span>
        </h2>
        <p className="text-stone-600 font-serif italic">
          "Draw the profile curve on the right. The wheel will shape the rest."<br/>
          <span className="text-xs font-sans text-stone-500 not-italic tracking-wide">
             请在右侧绘制器皿的轮廓曲线，转轮将自动生成对称造型。
          </span>
        </p>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-lg aspect-[3/4] bg-stone-50 rounded-sm shadow-2xl border-8 border-stone-100 ring-1 ring-stone-300 cursor-crosshair overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none"
        />
        
        {/* Overlay Hint */}
        {points.length === 0 && (
          <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-1 h-24 bg-gradient-to-b from-transparent via-stone-400 to-transparent mb-2 rounded-full" />
              <span className="text-stone-400 font-serif text-sm">Draw Here</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-6 items-center">
        <button 
          onClick={handleReset}
          className="group flex items-center space-x-2 px-6 py-3 border border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-800 transition-all font-serif rounded-full"
          aria-label="Reset Drawing"
        >
          <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
          <span>Reset (重置)</span>
        </button>
        
        <button 
          onClick={handleFinish}
          disabled={points.length < 10} // Ensure some content
          className={`flex items-center space-x-2 px-10 py-3 bg-stone-900 text-white font-serif rounded-full transition-all shadow-lg
            ${points.length < 10 
              ? 'opacity-50 cursor-not-allowed translate-y-0' 
              : 'hover:bg-blue-900 hover:scale-105 hover:shadow-xl translate-y-[-2px]'}`}
        >
          <span>Dry & Glaze (晾干施釉)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};