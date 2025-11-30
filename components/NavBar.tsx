import React from 'react';
import { AppStage } from '../types';
import { Palette, Flame, PenTool, Gem } from 'lucide-react';

interface NavBarProps {
  currentStage: AppStage;
}

const steps = [
  { id: AppStage.SHAPING, label: 'Shaping', subLabel: '拉坯', icon: PenTool },
  { id: AppStage.DECORATING, label: 'Glazing', subLabel: '施釉', icon: Palette },
  { id: AppStage.FIRING, label: 'Firing', subLabel: '烧窑', icon: Flame },
  { id: AppStage.RESULT, label: 'Collection', subLabel: '开窑', icon: Gem },
];

export const NavBar: React.FC<NavBarProps> = ({ currentStage }) => {
  if (currentStage === AppStage.INTRO) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#f7f5f0]/80 backdrop-blur-md border-b border-stone-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-wide">
            Jingdezhen Potter
          </h1>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-stone-500 font-sans tracking-widest uppercase mt-1">
              Intangible Heritage
            </span>
            <span className="text-[9px] text-stone-400 font-serif italic mt-0.5">
              Designed by Louise Lee
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-12">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStage;
            const isPast = steps.findIndex(s => s.id === currentStage) > idx;
            const Icon = step.icon;

            return (
              <div 
                key={step.id} 
                className={`group flex flex-col items-center relative py-2 px-2 md:px-0 transition-all duration-500
                  ${isActive ? 'text-blue-900 scale-105' : isPast ? 'text-stone-800' : 'text-stone-300'}
                `}
              >
                <div className="flex items-center space-x-2">
                  <Icon 
                    size={isActive ? 20 : 18} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all"
                  />
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className={`text-sm font-serif ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] opacity-70 font-sans">
                      {step.subLabel}
                    </span>
                  </div>
                </div>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -bottom-5 w-full h-0.5 bg-blue-900/50 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};