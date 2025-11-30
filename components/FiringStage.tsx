import React, { useEffect, useState, useRef } from 'react';
import { Flame, Zap, Wind, Trees } from 'lucide-react';
import { FiringSource } from '../types';

interface FiringStageProps {
  onComplete: (temperature: number, source: FiringSource) => void;
  isGenerating: boolean;
}

export const FiringStage: React.FC<FiringStageProps> = ({ onComplete, isGenerating }) => {
  const [isFiring, setIsFiring] = useState(false);
  const [targetTemp, setTargetTemp] = useState(1320);
  const [selectedSource, setSelectedSource] = useState<FiringSource>(FiringSource.ELECTRIC);
  
  const [currentTemp, setCurrentTemp] = useState(25);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState({ en: "Ready to Fire", cn: "准备烧制" });

  // Use a ref to ensure we only trigger completion once per firing cycle
  const hasTriggeredComplete = useRef(false);

  const startFiring = () => {
    setIsFiring(true);
    hasTriggeredComplete.current = false;
  };

  // EFFECT 1: HEATING PHASE (User interactions -> Target Temp)
  useEffect(() => {
    if (!isFiring || isGenerating || hasTriggeredComplete.current) return;

    const totalTime = 6000;
    const intervalTime = 50;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = currentStep / steps;
      setProgress(percent);

      // Temperature simulation logic based on targetTemp
      let temp = 25;
      if (percent < 0.2) {
        temp = Math.floor(25 + (600 * percent * 5));
        setPhase({ en: "Pre-heating", cn: "预热" });
      } else if (percent < 0.8) {
        const rampUp = (targetTemp - 600) * ((percent - 0.2) / 0.6);
        temp = Math.floor(600 + rampUp);
        setPhase({ en: "Firing", cn: "烧制" });
      } else {
        // Hold at max temp briefly
        temp = Math.floor(targetTemp - (20 * (percent - 0.8) * 5)); 
        setPhase({ en: "Peak Temperature", cn: "保温" });
      }
      
      setCurrentTemp(temp);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Only trigger if we haven't already
        if (!hasTriggeredComplete.current) {
          hasTriggeredComplete.current = true;
          onComplete(targetTemp, selectedSource);
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isFiring, isGenerating, targetTemp, selectedSource, onComplete]);


  // EFFECT 2: COOLING/TRANSMUTATION PHASE (Waiting for AI)
  // This runs when the App tells us it is generating content.
  useEffect(() => {
    if (!isGenerating) return;

    setPhase({ en: "Kiln Transmutation", cn: "窑变冷却中" });
    
    // Slow cooling animation loop
    const timer = setInterval(() => {
      setCurrentTemp(prev => {
        // Drop temperature slowly, creating a "cooling down" effect
        // Stop around 200 degrees so it doesn't go to zero instantly
        const nextTemp = prev - Math.floor(Math.random() * 5 + 3);
        return nextTemp > 200 ? nextTemp : 200;
      });
      
      // Keep progress bar full but pulsing via CSS or just stay full
      setProgress(1); 
    }, 100);

    return () => clearInterval(timer);
  }, [isGenerating]);


  // Fuel Options Data
  const fuelOptions = [
    {
      id: FiringSource.WOOD,
      label: 'Pine Wood',
      sub: '松木',
      icon: Trees,
      desc: 'Traditional. Unpredictable ash glazes & rustic beauty.',
      color: 'bg-amber-900 border-amber-700 text-amber-100'
    },
    {
      id: FiringSource.GAS,
      label: 'Natural Gas',
      sub: '天然气',
      icon: Wind,
      desc: 'Reduction Firing. Rich, deep, warm colors.',
      color: 'bg-blue-900 border-blue-700 text-blue-100'
    },
    {
      id: FiringSource.ELECTRIC,
      label: 'Electric Kiln',
      sub: '电力',
      icon: Zap,
      desc: 'Modern. Clean, bright, precise oxidation colors.',
      color: 'bg-stone-800 border-stone-600 text-stone-100'
    }
  ];

  // Render Setup Screen (Slider + Fuel) - Only show if we haven't started firing
  if (!isFiring) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 md:p-8 animate-fade-in bg-stone-900 text-stone-50 overflow-y-auto">
        <div className="max-w-4xl w-full space-y-8 my-auto">
           <div className="text-center space-y-2">
             <h2 className="text-3xl font-serif">Configure The Kiln</h2>
             <p className="text-stone-400 font-serif">Select your fuel and temperature. Chaos or Control?</p>
             <p className="text-xs text-stone-500 uppercase tracking-widest">设定窑温 · 选择燃料</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Temperature Control */}
             <div className="space-y-6 bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500"/> Temperature
                  </h3>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-5xl font-bold font-serif tabular-nums text-orange-400">{targetTemp}°C</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="1000" 
                    max="1450" 
                    step="10" 
                    value={targetTemp} 
                    onChange={(e) => setTargetTemp(parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                  />
                  <div className="flex justify-between text-xs text-stone-500 font-mono uppercase mt-2">
                    <span>1000°<br/>Matte</span>
                    <span className="text-right">1450°<br/>Yaobian</span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 italic">
                  Higher heat creates glossier, harder porcelain, but increases risk of transmutation.
                </p>
             </div>

             {/* Fuel Selection */}
             <div className="space-y-3">
               <h3 className="text-lg font-serif mb-2 flex items-center gap-2">
                 <Wind size={18} className="text-stone-400"/> Kiln Type / Fuel
               </h3>
               {fuelOptions.map((opt) => {
                 const isSelected = selectedSource === opt.id;
                 const Icon = opt.icon;
                 return (
                   <button
                     key={opt.id}
                     onClick={() => setSelectedSource(opt.id)}
                     className={`w-full p-4 rounded-md border text-left transition-all duration-300 flex items-center gap-4
                       ${isSelected ? opt.color + ' ring-1 ring-white/50 scale-[1.02]' : 'bg-stone-800/50 border-white/5 text-stone-400 hover:bg-stone-800'}
                     `}
                   >
                     <div className={`p-2 rounded-full ${isSelected ? 'bg-black/20' : 'bg-white/5'}`}>
                        <Icon size={20} />
                     </div>
                     <div>
                       <div className="flex items-baseline gap-2">
                         <span className="font-bold font-serif">{opt.label}</span>
                         <span className="text-xs opacity-70">{opt.sub}</span>
                       </div>
                       <p className="text-xs opacity-80 leading-tight mt-1">{opt.desc}</p>
                     </div>
                   </button>
                 )
               })}
             </div>

           </div>

           <div className="pt-4 flex flex-col items-center gap-4">
             <button 
               onClick={startFiring}
               className="px-12 py-4 bg-gradient-to-r from-orange-700 to-red-800 text-white font-serif text-lg rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center space-x-2"
             >
               <Flame size={20} />
               <span>Ignite Kiln (点火)</span>
             </button>
             <span className="text-[10px] text-stone-600 font-sans tracking-wider uppercase">Designed by Louise Lee</span>
           </div>
        </div>
      </div>
    );
  }

  // Render Animation Screen
  return (
    <div className="flex flex-col h-full items-center justify-center bg-[#0c0a09] text-orange-50 relative overflow-hidden font-serif">
      {/* Background Visuals */}
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] bg-gradient-to-b from-stone-900 to-black ${currentTemp > 500 ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`absolute inset-0 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/40 via-red-950/40 to-black ${currentTemp > 500 ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12 max-w-md w-full p-8">
        {/* Temperature Display */}
        <div className="relative">
          <h2 className={`text-8xl font-bold tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-200 transition-all duration-500 ${isGenerating ? 'scale-95 opacity-90' : 'scale-100'}`}>
            {currentTemp}°
          </h2>
          <span className="absolute -top-4 -right-8 text-xl text-stone-500">C</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full space-y-4">
          <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-orange-900 via-orange-500 to-yellow-200 shadow-[0_0_10px_rgba(255,165,0,0.5)] ${isGenerating ? 'animate-pulse' : ''}`}
              style={{ width: `${progress * 100}%`, transition: 'width 0.1s linear' }}
            />
          </div>
          
          <div className="flex justify-between items-end border-t border-stone-800 pt-4">
            <div className="text-left">
              <p className="text-3xl font-light text-white mb-1 transition-all">{phase.en}</p>
              <p className="text-sm text-stone-500 font-sans tracking-[0.2em] uppercase">Status</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-medium text-orange-500 mb-1 transition-all">{phase.cn}</p>
              <p className="text-sm text-stone-500 font-sans tracking-[0.2em] uppercase">状态</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};