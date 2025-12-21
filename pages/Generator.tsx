
import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Loader2, 
  Sparkles, 
  CheckCircle2,
  Zap,
  BrainCircuit,
  Lock,
  ChevronDown,
  Target,
  AlignLeft,
  Type,
  Globe,
  ArrowRight,
  ImageIcon,
  Layers
} from 'lucide-react';
import { generateSEOArticle, generateHeroImage } from '../services/gemini';
import { AIModelType, SEOConfig, UserSubscription, GeneratedArticle } from '../types';
import { useNavigate } from 'react-router-dom';

interface GeneratorProps {
  subscription: UserSubscription;
  onSaveArticle: (article: GeneratedArticle) => void;
  // Fix: Added 't' translation prop to match App.tsx usage
  t: any;
}

const basicLanguages = [
  { id: 'Français', label: 'Français', flag: '🇫🇷' },
  { id: 'English', label: 'English', flag: '🇺🇸' },
  { id: 'Español', label: 'Español', flag: '🇪🇸' },
];

const expertLanguages = [
  { id: 'Deutsch', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'Italiano', label: 'Italiano', flag: '🇮🇹' },
  { id: 'Português', label: 'Português', flag: '🇵🇹' },
  { id: 'Chinese', label: '中文 (Chinois)', flag: '🇨🇳' },
  { id: 'Japanese', label: '日本語 (Japonais)', flag: '🇯🇵' },
  { id: 'Arabic', label: 'العربية (Arabe)', flag: '🇸🇦' },
  { id: 'Russian', label: 'Русский (Russe)', flag: '🇷🇺' },
  { id: 'Korean', label: '한국어 (Coréen)', flag: '🇰🇷' },
];

const tones = [
  { id: 'Professional', label: 'Professionnel' },
  { id: 'Casual', label: 'Décontracté' },
  { id: 'Expert', label: 'Expert / Technique' },
  { id: 'Creative', label: 'Créatif' },
];

// Fix: Destructured 't' from props
const Generator: React.FC<GeneratorProps> = ({ subscription, onSaveArticle, t }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  
  const [options, setOptions] = useState({
    generateHero: false
  });

  const [config, setConfig] = useState<SEOConfig>({
    targetKeywords: [],
    language: 'Français',
    tone: 'Professional',
    wordCount: 800,
    includeMeta: true,
    audience: 'Tout public'
  });
  
  const [result, setResult] = useState<any>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Updated word count limits based on user level
  const maxWords = 
    subscription.level >= 3 ? 12000 : 
    subscription.level >= 2 ? 6000 : 
    subscription.level >= 1 ? 3000 : 1200;

  const hasProAccess = subscription.level >= 1;
  const hasExpertAccess = subscription.level >= 2;

  const stepsPool = [
    "Analyse sémantique du sujet...",
    "Exploration des entités nommées...",
    "Planification de la structure Hn...",
    "Rédaction neuronale en cours...",
    "Optimisation pour Google Search...",
    "Finalisation et mise en forme..."
  ];

  useEffect(() => {
    if (isGenerating) {
      setThinkingSteps([]);
      let i = 0;
      const interval = setInterval(() => {
        if (i < stepsPool.length) {
          setThinkingSteps(prev => [...prev, stepsPool[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!topic) return;
    if (subscription.articlesLimit !== Infinity && subscription.usedArticles >= subscription.articlesLimit) {
      alert("Votre quota est épuisé. Veuillez passer à un plan supérieur.");
      navigate('/billing');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setHeroImageUrl(null);
    setCopied(false);
    
    const apiConfig = JSON.parse(localStorage.getItem('seomate_api') || '{}');
    const model = apiConfig.defaultModel || (subscription.level >= 1 ? AIModelType.PRO : AIModelType.FAST);

    try {
      const data = await generateSEOArticle(topic, config, model);
      
      let hero = null;
      if (options.generateHero && hasProAccess) {
        setThinkingSteps(prev => [...prev, "Génération de l'image de couverture..."]);
        hero = await generateHeroImage(topic, data.title);
        setHeroImageUrl(hero);
      }
      
      const newArticle: GeneratedArticle = {
        id: `art-${Date.now()}`,
        title: data.title || topic,
        content: data.content,
        metaDescription: data.metaDescription || '',
        hashtags: data.hashtags || [],
        seoScore: data.seoScore || 85,
        status: 'draft',
        createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        timestamp: Date.now(),
        lang: config.language
      };
      
      setResult(data);
      onSaveArticle(newArticle);
    } catch (error) {
      console.error("Erreur de génération:", error);
      alert("La forge a rencontré une erreur. Vérifiez votre configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allLanguages = [...basicLanguages, ...expertLanguages];
  const selectedLang = allLanguages.find(l => l.id === config.language) || allLanguages[0];
  const selectedTone = tones.find(t => t.id === config.tone) || tones[0];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-5xl font-black flex items-center gap-6 tracking-tighter text-slate-900">
          {t.gen_title}
          <div className="p-4 rounded-[28px] bg-slate-900 shadow-2xl animate-floating"><Sparkles className="w-8 h-8 text-white" /></div>
        </h1>

        <div className="flex p-1.5 bg-slate-100 rounded-[24px]">
          <button 
            onClick={() => setActiveTab('single')}
            className={`px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            <Type className="w-3 h-3" /> {t.gen_tab_single}
          </button>
          <button 
            onClick={() => {
              if (!hasExpertAccess) navigate('/billing');
              else setActiveTab('bulk');
            }}
            className={`px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'bulk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            <Layers className="w-3 h-3" /> {t.gen_tab_bulk} {!hasExpertAccess && <Lock className="w-2 h-2" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[48px] shadow-3xl space-y-8 border border-white">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 flex items-center gap-2">
                {activeTab === 'single' ? t.gen_label_topic : t.gen_label_bulk} 
                <Target className="w-3 h-3" />
              </label>
              <textarea 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder={activeTab === 'single' ? t.gen_placeholder : t.gen_label_bulk} 
                className="w-full p-6 rounded-[32px] border-2 outline-none min-h-[140px] text-base font-bold bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600 transition-all resize-none shadow-inner" 
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 flex items-center gap-2">{t.gen_label_length} <AlignLeft className="w-3 h-3" /></label>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{config.wordCount} mots</span>
              </div>
              <input 
                type="range" 
                min="300" 
                max={maxWords} 
                step="100"
                value={config.wordCount}
                onChange={(e) => setConfig({...config, wordCount: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                <span className={subscription.level === 0 ? 'text-indigo-600' : ''}>Starter (1.2k)</span>
                <span className={subscription.level === 1 ? 'text-indigo-600' : ''}>Pro (3k)</span>
                <span className={subscription.level >= 2 ? 'text-indigo-600' : ''}>Expert (6k+)</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t.gen_label_options}</label>
              <div className="space-y-3">
                <button 
                  disabled={!hasProAccess}
                  onClick={() => setOptions({...options, generateHero: !options.generateHero})}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${options.generateHero ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-50 opacity-60'}`}
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-widest">{t.gen_opt_hero}</span>
                  </div>
                  {!hasProAccess ? <Lock className="w-3 h-3" /> : <div className={`w-4 h-4 rounded-full border-2 ${options.generateHero ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}></div>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t.gen_label_lang}</label>
                <div className="relative">
                  <button onClick={() => { setShowLangMenu(!showLangMenu); setShowToneMenu(false); }} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold truncate">
                    <span>{selectedLang.flag} {selectedLang.id.substring(0,6)}.</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLangMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[24px] shadow-4xl z-[100] p-2 max-h-80 overflow-y-auto scrollbar-hide">
                      {basicLanguages.map(lang => (
                        <button key={lang.id} onClick={() => { setConfig({...config, language: lang.id}); setShowLangMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-[10px] font-black flex items-center gap-2">
                          <span>{lang.flag}</span> {lang.id}
                        </button>
                      ))}
                      {expertLanguages.map(lang => (
                        <button 
                          key={lang.id} 
                          disabled={!hasExpertAccess}
                          onClick={() => { setConfig({...config, language: lang.id}); setShowLangMenu(false); }} 
                          className={`w-full text-left p-3 rounded-xl text-[10px] font-black flex items-center justify-between ${hasExpertAccess ? 'hover:bg-indigo-50' : 'opacity-40 grayscale'}`}
                        >
                          <div className="flex items-center gap-2"><span>{lang.flag}</span> {lang.id}</div>
                          {!hasExpertAccess && <Lock className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t.gen_label_tone}</label>
                <div className="relative">
                  <button onClick={() => { setShowToneMenu(!showToneMenu); setShowLangMenu(false); }} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold truncate">
                    <span>{selectedTone.label.substring(0,8)}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showToneMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[24px] shadow-4xl z-[100] p-2 space-y-1">
                      {tones.map(tone => (
                        <button key={tone.id} onClick={() => { setConfig({...config, tone: tone.id}); setShowToneMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-[10px] font-black">
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={isGenerating || !topic} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {activeTab === 'bulk' ? t.gen_btn_batch : t.gen_btn_forge}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-slate-900 rounded-[64px] h-[700px] flex flex-col items-center justify-center p-16 text-center shadow-4xl overflow-hidden relative border border-white/5">
               <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] animate-pulse"></div>
               <div className="space-y-12 relative z-10">
                  <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto animate-floating">
                    <BrainCircuit className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">{t.gen_loading}</h3>
                  <div className="bg-slate-950/90 border border-white/10 rounded-[32px] p-6 text-left font-mono text-[10px] space-y-2 h-40 overflow-y-auto w-full max-w-sm scrollbar-hide">
                    {thinkingSteps.map((step, idx) => <div key={idx} className="text-indigo-400/80">✓ {step}</div>)}
                    <div className="text-indigo-500 animate-pulse">_ Neural synthesis active...</div>
                  </div>
               </div>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in zoom-in duration-700">
                <div className="bg-white border border-slate-100 rounded-[64px] overflow-hidden shadow-2xl">
                    {heroImageUrl && (
                      <div className="w-full h-80 overflow-hidden relative">
                         <img src={heroImageUrl} className="w-full h-full object-cover" alt="Hero" />
                         <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase border border-white/20">Image Générée par IA</div>
                      </div>
                    )}
                    <div className="p-12 md:p-20 text-center space-y-8">
                      <div className="flex justify-center"><span className="px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest border border-indigo-100">{t.gen_certified}</span></div>
                      <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">{result.title}</h1>
                    </div>
                    <div className="p-12 md:p-20 pt-0 prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                      {result.content}
                    </div>
                    <div className="p-12 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.gen_score}</span>
                             <span className="text-xl font-black text-indigo-600">{result.seoScore}%</span>
                          </div>
                       </div>
                       <button onClick={copyToClipboard} className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl">
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                          {copied ? t.gen_copied : t.gen_copy}
                       </button>
                    </div>
                </div>
            </div>
          ) : (
            <div className="glass border-4 border-dashed border-slate-200 rounded-[80px] h-[700px] flex flex-col items-center justify-center p-20 text-center group hover:border-indigo-200 transition-all">
              <div className="p-12 bg-slate-900 rounded-[32px] mb-8 animate-floating group-hover:scale-110 transition-transform"><Zap className="w-12 h-12 text-white" /></div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{t.gen_ready}</h3>
              <p className="text-slate-400 text-lg max-w-md mt-4 font-medium">Configurez votre sujet à gauche et choisissez vos options de pack premium.</p>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl opacity-40">
                 <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <ImageIcon className="w-6 h-6 mx-auto mb-3" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Images Hero</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <Globe className="w-6 h-6 mx-auto mb-3" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Multi-langues</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
