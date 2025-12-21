
import React, { useState } from 'react';
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  Loader2, 
  Maximize2, 
  Share2, 
  Target,
  Zap,
  Lock,
  Palette,
  Layout,
  LayoutTemplate,
  Monitor
} from 'lucide-react';
import { generateHeroImage } from '../services/gemini';
import { UserSubscription, GeneratedImage } from '../types';
import { useNavigate } from 'react-router-dom';

interface ImageStudioProps {
  subscription: UserSubscription;
  t: any;
  history: GeneratedImage[];
  onSaveImage: (prompt: string, url: string) => void;
}

const styles = [
  { id: 'photorealistic', label: 'Réaliste', icon: '📸', prompt: 'photorealistic, ultra-high definition, detailed textures' },
  { id: 'anime', label: 'Anime', icon: '🎨', prompt: 'modern high-quality anime style, vivid colors, clean lines' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🌃', prompt: 'cyberpunk aesthetic, neon lighting, futuristic, dark atmosphere' },
  { id: '3d-render', label: '3D / CGI', icon: '💻', prompt: '3D octan render, unreal engine 5, cinematic lighting, professional CGI' },
  { id: 'minimalist', label: 'Minimaliste', icon: '⬜', prompt: 'minimalist design, clean background, simple elements, vector art' },
  { id: 'oil-painting', label: 'Peinture', icon: '🖼️', prompt: 'oil painting style, rich brushstrokes, classical art feel' },
];

const ImageStudio: React.FC<ImageStudioProps> = ({ subscription, t, history, onSaveImage }) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const hasProAccess = subscription.level >= 1;

  const handleGenerate = async () => {
    if (!prompt) return;
    if (!hasProAccess) {
      navigate('/billing');
      return;
    }

    setIsGenerating(true);
    try {
      const enrichedPrompt = `Style: ${selectedStyle.prompt}. Topic: ${prompt}. Quality: 8k, professional, trending on ArtStation.`;
      const imageUrl = await generateHeroImage(enrichedPrompt, "Studio Image Production", aspectRatio);
      
      if (imageUrl) {
        setResultImage(imageUrl);
        onSaveImage(prompt, imageUrl);
      }
    } catch (error) {
      console.error("Erreur de génération d'image:", error);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `seomate-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{t.img_title}</h1>
          <p className="text-slate-500 font-medium mt-2">{t.img_subtitle}</p>
        </div>
        {!hasProAccess && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4">
             <Lock className="w-5 h-5 text-amber-600" />
             <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">{t.img_pro_lock}</p>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
           <div className="glass p-8 rounded-[48px] shadow-3xl border border-white space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 flex items-center gap-2">{t.img_label_vision} <Target className="w-3 h-3" /></label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.img_placeholder}
                    className="w-full p-6 rounded-[32px] border-2 outline-none min-h-[160px] text-base font-bold bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600 transition-all resize-none shadow-inner"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 flex items-center gap-2">{t.img_label_style} <Palette className="w-3 h-3" /></label>
                 <div className="grid grid-cols-2 gap-3">
                    {styles.map(style => (
                      <button 
                        key={style.id} 
                        onClick={() => setSelectedStyle(style)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selectedStyle.id === style.id ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-50 text-slate-400'}`}
                      >
                        <span className="text-xl">{style.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t.img_label_format}</label>
                 <div className="grid grid-cols-3 gap-3">
                    {[
                      {id: '1:1', icon: Layout, label: 'Carré'},
                      {id: '16:9', icon: Monitor, label: 'Paysage'},
                      {id: '9:16', icon: LayoutTemplate, label: 'Portrait'}
                    ].map(ratio => (
                      <button 
                        key={ratio.id} 
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${aspectRatio === ratio.id ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-50 text-slate-400'}`}
                      >
                        <ratio.icon className="w-4 h-4 mb-2" />
                        <span className="text-[8px] font-black uppercase">{ratio.label}</span>
                        <span className="text-[7px] opacity-60 font-bold">{ratio.id}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || !hasProAccess}
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {t.img_btn_gen}
              </button>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
           {isGenerating ? (
             <div className="bg-slate-900 rounded-[64px] h-[600px] flex flex-col items-center justify-center p-16 text-center shadow-4xl relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] animate-pulse"></div>
                <div className="space-y-8 relative z-10">
                   <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto animate-floating">
                      <ImageIcon className="w-12 h-12 text-indigo-500" />
                   </div>
                   <h3 className="text-3xl font-black text-white tracking-tighter">{t.img_loading}</h3>
                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Style: {selectedStyle.label}</div>
                   <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-indigo-500 w-1/2 animate-[progress_2s_infinite]"></div>
                   </div>
                </div>
             </div>
           ) : resultImage ? (
             <div className="space-y-6 animate-in zoom-in duration-700">
                <div className={`bg-white border border-slate-100 rounded-[64px] overflow-hidden shadow-2xl relative group flex items-center justify-center p-8 bg-slate-50`}>
                   <div className={`relative ${aspectRatio === '16:9' ? 'aspect-video w-full' : aspectRatio === '9:16' ? 'aspect-[9/16] h-[600px]' : 'aspect-square h-[500px]'} overflow-hidden rounded-[32px] shadow-2xl`}>
                      <img src={resultImage} className="w-full h-full object-cover" alt="Generated" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button onClick={() => downloadImage(resultImage)} className="p-4 bg-white rounded-full shadow-2xl hover:scale-110 transition-transform">
                            <Download className="w-6 h-6 text-slate-900" />
                          </button>
                      </div>
                   </div>
                </div>
                <div className="flex justify-between items-center p-8 bg-white border border-slate-100 rounded-[40px] shadow-lg">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-black uppercase text-slate-900">{selectedStyle.label}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                      <div className="hidden sm:flex items-center gap-4">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-600 truncate max-w-xs italic">"{prompt}"</p>
                      </div>
                   </div>
                   <button onClick={() => downloadImage(resultImage)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                     {t.img_download} <Download className="w-4 h-4" />
                   </button>
                </div>
             </div>
           ) : (
             <div className="glass border-4 border-dashed border-slate-200 rounded-[80px] h-[600px] flex flex-col items-center justify-center p-20 text-center group hover:border-indigo-200 transition-all">
                <div className="p-12 bg-slate-900 rounded-[32px] mb-8 animate-floating group-hover:scale-110 transition-transform">
                   <ImageIcon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Votre créativité sans limite</h3>
                <p className="text-slate-400 text-lg max-w-md mt-4 font-medium">Choisissez un style, un format, et laissez l'IA générer l'image parfaite.</p>
             </div>
           )}

           {history.length > 0 && (
             <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">{t.img_history}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {history.slice(0, 4).map((item) => (
                     <div key={item.id} className="aspect-square rounded-[32px] overflow-hidden border-2 border-white shadow-xl group relative">
                        <img src={item.url} className="w-full h-full object-cover" alt="History" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => setResultImage(item.url)} className="p-3 bg-white rounded-full">
                              <Maximize2 className="w-4 h-4 text-slate-900" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
