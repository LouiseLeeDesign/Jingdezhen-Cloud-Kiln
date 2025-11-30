import React, { useState, useCallback } from 'react';
import { NavBar } from './components/NavBar';
import { ShapingStage } from './components/ShapingStage';
import { DecoratingStage } from './components/DecoratingStage';
import { FiringStage } from './components/FiringStage';
import { ResultStage } from './components/ResultStage';
import { AppStage, PorcelainStyle, GeneratedPorcelain, FiringSource } from './types';
import { generatePorcelainDescription, generatePorcelainImage } from './services/geminiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.INTRO);
  const [shapeImage, setShapeImage] = useState<string | null>(null);
  const [style, setStyle] = useState<PorcelainStyle | null>(null);
  const [temperature, setTemperature] = useState<number>(1320);
  const [firingSource, setFiringSource] = useState<FiringSource>(FiringSource.ELECTRIC);
  const [result, setResult] = useState<GeneratedPorcelain | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Transitions
  const handleStart = () => setStage(AppStage.SHAPING);
  
  const handleShapeComplete = (imgData: string) => {
    setShapeImage(imgData);
    setStage(AppStage.DECORATING);
  };

  const handleDecorationComplete = (selectedStyle: PorcelainStyle) => {
    setStyle(selectedStyle);
    setStage(AppStage.FIRING);
  };

  // Wrapped in useCallback to ensure stability and prevent double-invocation loops
  const handleFiringComplete = useCallback(async (finalTemp: number, source: FiringSource) => {
    // Prevent double-triggering if already generating
    if (isGenerating) return;
    
    setTemperature(finalTemp);
    setFiringSource(source);
    setIsGenerating(true);
    
    // We do NOT return early here if data is missing, we handle errors below.
    // However, if we don't have shape/style, we can't generate.
    if (!shapeImage || !style) {
       console.error("Missing shape or style data");
       setIsGenerating(false);
       return;
    }

    try {
      // Parallel Generation
      const [imageUrl, textData] = await Promise.all([
        generatePorcelainImage(shapeImage, style, finalTemp, source),
        generatePorcelainDescription(style, finalTemp, source)
      ]);

      // CRITICAL: Preload Image to prevent glitch/pop-in
      // This ensures the ResultStage only mounts once the image is fully ready to display.
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to show placeholder
        img.src = imageUrl;
      });

      setResult({
        imageUrl,
        temperature: finalTemp,
        firingSource: source,
        ...textData
      });

      setStage(AppStage.RESULT);
    } catch (error) {
      console.error("Workflow failed", error);
      // Graceful fallback
      setResult({
        imageUrl: "https://placehold.co/800x800/f0f0f0/999999.png?text=Firing+Error",
        name: "Echo of the Kiln (窑之回响)",
        description: "The fires were unpredictable today. A unique, unexpected form has emerged from the ashes.",
        poem: "Fire dances wild,\nForm born of chaos.",
        temperature: finalTemp,
        firingSource: source
      });
      setStage(AppStage.RESULT);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, shapeImage, style]);

  const handleReset = () => {
    setStage(AppStage.INTRO);
    setShapeImage(null);
    setStyle(null);
    setResult(null);
    setIsGenerating(false);
  };

  const renderContent = () => {
    switch (stage) {
      case AppStage.INTRO:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 relative overflow-hidden bg-stone-900">
             {/* Hero Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center z-0 scale-105 animate-[kenburns_30s_ease-out_infinite_alternate] opacity-40"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1622372540608-d8916d8c067e?q=80&w=2666&auto=format&fit=crop')` }}
            />
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-30 z-0 mix-blend-overlay" />
            
            {/* Giant Chinese Character Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] md:text-[30rem] font-serif text-white opacity-[0.03] select-none z-0 pointer-events-none">
              瓷
            </div>

            <div className="relative z-20 max-w-5xl space-y-10 p-12 animate-fade-in-up">
              <div className="space-y-4">
                <div className="inline-block border-b border-stone-500 pb-2 mb-4">
                  <h2 className="text-sm md:text-base font-light text-stone-400 tracking-[0.4em] uppercase">Intangible Cultural Heritage</h2>
                </div>
                <h1 className="text-6xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-500 tracking-tight drop-shadow-xl">
                  Jingdezhen
                </h1>
                <p className="text-3xl md:text-5xl font-light italic font-serif text-stone-400 mt-2">
                  The Porcelain Capital
                </p>
              </div>
              
              <div className="max-w-xl mx-auto space-y-6">
                <p className="text-lg md:text-xl font-light leading-relaxed text-stone-300 font-serif">
                  "White as jade, bright as a mirror, thin as paper, sound like a chime."
                </p>
                <p className="text-sm md:text-base text-stone-500 font-serif border-l-2 border-stone-700 pl-4 text-left">
                  Shape the clay, glaze with tradition, and witness the transformation of fire.
                  <br/>
                  <span className="opacity-70">
                     白如玉，明如镜，薄如纸，声如磬。体验千年瓷都技艺。
                  </span>
                </p>
              </div>
              
              <div className="pt-12">
                <button 
                  onClick={handleStart}
                  className="group relative px-16 py-5 bg-stone-100 text-stone-900 text-xl font-serif font-bold rounded-sm overflow-hidden transition-all hover:bg-blue-900 hover:text-white hover:scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)] duration-500 border border-transparent hover:border-blue-700"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Creating <span className="text-sm font-normal opacity-70">(开工)</span>
                  </span>
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8 text-right z-20">
              <p className="text-stone-500 text-[10px] font-sans tracking-widest uppercase">Experience Designed By</p>
              <p className="text-stone-300 text-sm font-serif italic tracking-wider">Louise Lee</p>
            </div>
          </div>
        );

      case AppStage.SHAPING:
        return <ShapingStage onComplete={handleShapeComplete} />;

      case AppStage.DECORATING:
        return <DecoratingStage onComplete={handleDecorationComplete} />;

      case AppStage.FIRING:
        return (
          <div className="h-full relative">
            <FiringStage 
              onComplete={handleFiringComplete} 
              isGenerating={isGenerating}
            />
            {isGenerating && (
              <div className="absolute bottom-16 left-0 w-full flex justify-center z-50 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/10 text-center shadow-2xl">
                   <div className="flex items-center gap-3 justify-center text-orange-200 mb-2">
                     <Loader2 className="animate-spin" size={24} />
                     <span className="text-lg font-serif">The Kiln Gods are working...</span>
                   </div>
                   <p className="text-xs text-stone-400 uppercase tracking-widest font-sans">Designed by Louise Lee</p>
                 </div>
              </div>
            )}
          </div>
        );

      case AppStage.RESULT:
        return result ? <ResultStage data={result} onReset={handleReset} /> : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-[#f7f5f0] flex flex-col overflow-hidden">
      <NavBar currentStage={stage} />
      <main className="flex-grow relative h-full pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;