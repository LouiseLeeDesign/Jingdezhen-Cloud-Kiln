import React, { useState } from 'react';
import { PorcelainStyle } from '../types';
import { Check, Info } from 'lucide-react';

interface DecoratingStageProps {
  onComplete: (style: PorcelainStyle) => void;
}

// Data for the "Four Famous Porcelains" of Jingdezhen
const styles = [
  {
    id: PorcelainStyle.BLUE_WHITE,
    name: 'Blue & White',
    chinese: '青花',
    pinyin: 'Qīnghuā',
    desc: 'The most iconic style. Cobalt oxide creates blue designs on white clay under a transparent glaze.',
    desc_cn: '白地蓝花，幽靓典雅。景德镇四大名瓷之首。',
    // CSS Pattern to simulate the style
    pattern: 'radial-gradient(circle at 50% 50%, #1e3a8a 2px, transparent 2.5px), radial-gradient(circle at 0% 0%, #1e3a8a 10px, transparent 15px), radial-gradient(circle at 100% 100%, #1e3a8a 10px, transparent 15px), #f0f9ff',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200'
  },
  {
    id: PorcelainStyle.RICE_PATTERN,
    name: 'Rice-pattern',
    chinese: '玲珑',
    pinyin: 'Línglóng',
    desc: 'Pierced "rice grain" holes filled with glaze, creating a translucent effect, often combined with Blue & White.',
    desc_cn: '玲珑剔透，明彻透亮。以“米粒”状镂空装饰著称。',
    // Simulation: grid of dots
    pattern: 'radial-gradient(rgba(255,255,255,0.9) 2px, transparent 3px), repeating-linear-gradient(45deg, #e0f2fe 0, #e0f2fe 10px, #eff6ff 10px, #eff6ff 20px)',
    textColor: 'text-cyan-900',
    borderColor: 'border-cyan-200'
  },
  {
    id: PorcelainStyle.FAMILLE_ROSE,
    name: 'Famille Rose',
    chinese: '粉彩',
    pinyin: 'Fěncǎi',
    desc: 'Soft, pastel enamel colors painted over fired glaze. Known for delicate floral and bird motifs.',
    desc_cn: '色彩柔和，画工细腻。有“东方艺术明珠”之美誉。',
    // Simulation: Soft pastel gradients
    pattern: 'radial-gradient(circle at 30% 30%, #fbcfe8 0%, transparent 40%), radial-gradient(circle at 70% 70%, #bbf7d0 0%, transparent 40%), #fff1f2',
    textColor: 'text-pink-900',
    borderColor: 'border-pink-200'
  },
  {
    id: PorcelainStyle.COLOR_GLAZE,
    name: 'Color Glaze',
    chinese: '颜色釉',
    pinyin: 'Yánsè Yòu',
    desc: 'High-temperature colored glazes. Includes sacrificial red, sapphire blue, and tea-dust glazes.',
    desc_cn: '入窑一色，出窑万彩。晶莹剔透，流光溢彩。',
    // Simulation: Deep rich gradient
    pattern: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)',
    textColor: 'text-red-900',
    borderColor: 'border-red-200'
  }
];

export const DecoratingStage: React.FC<DecoratingStageProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<PorcelainStyle | null>(null);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 animate-fade-in">
       <div className="max-w-3xl w-full text-center mb-8 space-y-3">
        <h2 className="text-4xl font-serif text-stone-900">
          Select Glaze <span className="text-stone-300 mx-2">|</span> <span className="font-light">施釉</span>
        </h2>
        <p className="text-stone-600 font-serif text-lg">
          Choose from the "Four Famous Porcelains" of Jingdezhen.<br/>
          <span className="text-sm font-sans text-stone-500">请选择景德镇四大名瓷之一。</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelected(style.id)}
            className={`relative flex flex-row overflow-hidden rounded-md text-left transition-all duration-500 group border h-36 md:h-44
              ${selected === style.id 
                ? 'ring-2 ring-stone-900 shadow-2xl scale-[1.02] bg-white border-transparent' 
                : 'hover:shadow-xl hover:-translate-y-1 bg-white border-stone-200'}
            `}
          >
            {/* Visual Preview Section (Left) */}
            <div 
              className="w-1/3 h-full relative border-r border-stone-100"
              style={{ background: style.pattern }}
            >
              {/* Overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20" />
              {selected === style.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                  <div className="bg-white text-stone-900 p-2 rounded-full shadow-lg">
                    <Check size={20} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            {/* Text Content (Right) */}
            <div className="w-2/3 p-5 flex flex-col justify-center space-y-2">
              <div className="flex justify-between items-start">
                <h3 className={`text-xl font-serif font-bold ${selected === style.id ? style.textColor : 'text-stone-800'}`}>
                  {style.name}
                </h3>
                <span className="text-lg font-serif text-stone-900 font-medium">{style.chinese}</span>
              </div>
              
              <div className="space-y-1">
                 <p className="text-xs font-sans text-stone-400 uppercase tracking-widest">{style.pinyin}</p>
                 <p className="text-stone-600 text-sm leading-snug font-serif line-clamp-2 md:line-clamp-none">
                  {style.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12">
        <button
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className={`px-12 py-4 text-lg font-serif rounded-full transition-all duration-500 shadow-xl
            ${!selected 
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
              : 'bg-stone-900 text-white hover:bg-red-900 hover:scale-105 hover:shadow-2xl'}
          `}
        >
          Prepare for Firing (准备烧制)
        </button>
      </div>
    </div>
  );
};
