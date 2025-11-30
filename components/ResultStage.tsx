import React, { useState } from 'react';
import { GeneratedPorcelain } from '../types';
import { RefreshCw, Download, Info } from 'lucide-react';

interface ResultStageProps {
  data: GeneratedPorcelain;
  onReset: () => void;
}

export const ResultStage: React.FC<ResultStageProps> = ({ data, onReset }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `jingdezhen-collection-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 max-w-7xl mx-auto animate-fade-in">
        
        {/* Left: The Illustration (Modern Gallery Display) */}
        <div className="w-full lg:w-1/2 flex justify-center perspective-1000">
          <div 
            className="relative w-full max-w-md aspect-[4/5] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 group transition-all duration-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Very subtle noise, cleaner than before */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`}} 
             />

            {/* The Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={data.imageUrl} 
                alt={data.name} 
                className="max-w-full max-h-full object-contain filter contrast-[1.02]"
              />
            </div>
            
            {/* Controls */}
            <div className={`absolute bottom-6 left-6 z-20 flex space-x-3 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={handleDownload}
                className="p-3 bg-stone-900 text-white rounded-full hover:bg-red-900 shadow-lg transition-colors"
                title="Add to Collection"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: The Label */}
        <div className="w-full lg:w-1/2 space-y-10">
          
          <div className="space-y-4 border-b border-stone-200 pb-8">
            <div className="flex items-center space-x-3 text-stone-400 text-xs font-sans tracking-[0.2em] uppercase">
              <span>No. {Math.floor(Math.random() * 10000)}</span>
              <span className="w-px h-3 bg-stone-300" />
              <span>{data.temperature}°C</span>
              <span className="w-px h-3 bg-stone-300" />
              <span>{data.firingSource}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight font-medium">
              {data.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 font-sans">Curator's Note</h3>
              <p className="text-stone-600 leading-relaxed font-serif text-lg">
                {data.description}
              </p>
            </div>
            
            {/* Vertical Poem Display - Modernized */}
            <div className="relative bg-stone-50 p-6 rounded-sm border-l-2 border-stone-900">
               <div className="flex justify-center h-full">
                  <div className="font-serif text-stone-800 text-lg md:text-xl leading-loose vertical-text h-40 md:h-48 tracking-widest select-none">
                    {data.poem}
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-stone-100 mt-4">
             <div className="flex flex-col mt-4 md:mt-0">
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-widest">AI Generated</span>
                <span className="text-xs text-stone-500 font-serif italic mt-1">Designed by Louise Lee</span>
             </div>
             
             <button 
              onClick={onReset}
              className="group flex items-center space-x-3 px-8 py-3 bg-white border border-stone-200 text-stone-900 rounded-full hover:bg-stone-50 hover:border-stone-400 transition-all font-serif shadow-sm hover:shadow-md mt-4 md:mt-0"
            >
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
              <span>Create Another (再造)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};