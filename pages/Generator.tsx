
import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Loader2, 
  ExternalLink,
  Info,
  Sparkles,
  Image as ImageIcon,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  CheckCircle2,
  RefreshCw,
  Lock,
  AlignLeft,
  ArrowUpCircle,
  Hash,
  Layout,
  Type as TypeIcon,
  Crown,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateSEOArticle, suggestKeywords, generateHeroImage, remixForSocial } from '../services/gemini';
import { AIModelType, SEOConfig, PlanType, GeneratedArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePlan } from '../context/PlanContext';
import { useContent } from '../context/ContentContext';

const Generator: React.FC = () => {
  const { t } = useLanguage();
  const { isLanguageAvailable, getPlanRequirement, getWordCountLimits, absoluteMax, plan } = usePlan();
  const { addItem } = useContent();
  const limits = getWordCountLimits();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAlchemistWorking, setIsAlchemistWorking] = useState(false);
  const [topic, setTopic] = useState('');
  const [config, setConfig] = useState<SEOConfig>({
    targetKeywords: [],
    language: 'English',
    tone: 'Professional',
    wordCount: 1200,
    includeMeta: true,
    audience: 'General'
  });
  
  useEffect(() => {
    if (config.wordCount > limits.article) {
      setConfig(prev => ({ ...prev, wordCount: limits.article }));
    }
  }, [limits.article]);

  const [result, setResult] = useState<any>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [socialRemix, setSocialRemix] = useState<any>(null);
  const [modelType, setModelType] = useState<AIModelType>(AIModelType.PRO);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const languageKeys = [
    'English', 'French', 'Spanish', 'German', 'Chinese', 'Arabic', 
    'Hindi', 'Bengali', 'Russian', 'Portuguese'
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    
    // Reset states
    setIsGenerating(true);
    setIsAlchemistWorking(false);
    setResult(null);
    setHeroImage(null);
    setSocialRemix(null);

    try {
      // Step 1: Generate the Article
      const articleData = await generateSEOArticle(topic, config, modelType);
      
      // Add unique ID and save to context history
      const fullArticle: GeneratedArticle = {
        ...articleData,
        id: crypto.randomUUID(),
        type: 'article',
        createdAt: new Date().toISOString(),
        status: 'draft',
        model: modelType,
        language: config.language
      };
      
      setResult(fullArticle);
      addItem(fullArticle);
      
      // Article is ready, stop main loader but start Alchemy loader immediately
      setIsGenerating(false);
      setIsAlchemistWorking(true);

      // Step 2: Generate Visuals and Social Pack in parallel automatically
      const [img, social] = await Promise.all([
        generateHeroImage(topic, articleData.title),
        remixForSocial(articleData.content)
      ]);
      
      setHeroImage(img);
      setSocialRemix(social);
    } catch (error) {
      console.error(error);
      alert('Generation failed.');
      setIsGenerating(false);
    } finally {
      setIsAlchemistWorking(false);
    }
  };

  const isAtLimit = config.wordCount >= limits.article;

  const presets = [
    { label: 'Court', value: 600 },
    { label: 'Standard', value: 1200 },
    { label: 'Pilier', value: 2500 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {t.generator.title} <Sparkles className="w-8 h-8 text-indigo-600 fill-indigo-600" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">{t.generator.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sujet Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-indigo-600" /> 1. DEFINIR LE SUJET
            </label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.generator.placeholderTopic}
              className="w-full p-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[120px] text-sm font-bold transition-all resize-none placeholder:text-slate-300"
            />
            <div className="flex justify-between items-center pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mots-clés cibles</label>
              <button onClick={async () => {
                if(!topic) return;
                const kw = await suggestKeywords(topic);
                setConfig({...config, targetKeywords: kw});
              }} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Suggérer</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.targetKeywords.length > 0 ? config.targetKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black border border-indigo-100 uppercase">{kw}</span>
              )) : (
                <span className="text-[10px] text-slate-300 font-bold italic">Aucun mot-clé spécifié...</span>
              )}
            </div>
          </div>

          {/* Word Count Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50"></div>
            
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-indigo-600" /> 2. LONGUEUR
              </label>
              <div className="text-right">
                <span className={`text-2xl font-black transition-all ${isAtLimit ? 'text-amber-500' : 'text-indigo-600'}`}>
                  {config.wordCount}
                </span>
                <span className="text-[10px] font-black text-slate-300 ml-1 uppercase">Mots</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => {
                const isLocked = p.value > limits.article;
                const isActive = config.wordCount === p.value;
                return (
                  <button
                    key={p.label}
                    disabled={isLocked}
                    onClick={() => setConfig({ ...config, wordCount: p.value })}
                    className={`p-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex flex-col items-center justify-center ${
                      isLocked 
                      ? 'opacity-30 bg-slate-50 border-slate-50 cursor-not-allowed' 
                      : isActive
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[8px] opacity-60 mt-0.5">{p.value}m</span>
                  </button>
                );
              })}
            </div>

            <div className="relative h-6 flex items-center">
              <input 
                type="range"
                min="300"
                max={absoluteMax.article}
                step="100"
                value={config.wordCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val <= limits.article) setConfig({ ...config, wordCount: val });
                }}
                className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-600 bg-slate-100`}
              />
              <div 
                className="absolute h-full w-1 bg-slate-300 rounded-full pointer-events-none" 
                style={{ left: `${(limits.article / absoluteMax.article) * 100}%` }}
              ></div>
            </div>

            {isAtLimit && plan !== PlanType.PREMIUM && (
              <Link to="/billing" className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-2xl group transition-all hover:bg-amber-100">
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3 text-amber-600 fill-current" />
                  <span className="text-[9px] font-black text-amber-900 uppercase">Augmenter la limite</span>
                </div>
                <ChevronRight className="w-3 h-3 text-amber-500" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Langue</label>
                <select 
                  value={config.language}
                  onChange={(e) => setConfig({...config, language: e.target.value})}
                  className="w-full p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold bg-slate-50 outline-none cursor-pointer"
                >
                  {languageKeys.map(key => {
                    const isAvailable = isLanguageAvailable(key);
                    const reqPlan = getPlanRequirement(key);
                    const label = (t.common.languages as any)[key] || key;
                    return (
                      <option key={key} value={key} disabled={!isAvailable} className={!isAvailable ? 'text-slate-400' : ''}>
                        {label} {!isAvailable && reqPlan ? `(${reqPlan})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA</label>
                <select 
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value as AIModelType)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold bg-slate-50 outline-none cursor-pointer"
                >
                  <option value={AIModelType.PRO}>Pro</option>
                  <option value={AIModelType.FAST}>Flash</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || isAlchemistWorking || !topic}
            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
            {t.generator.generateBtn}
          </button>
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-white border border-slate-100 rounded-[40px] h-[700px] flex flex-col items-center justify-center text-center p-20 animate-pulse shadow-sm">
               <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-8">
                  <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">{t.generator.forging}</h3>
               <p className="text-slate-400 font-medium max-w-sm">{t.generator.wait}</p>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 backdrop-blur-xl relative z-20">
                  <div className="flex items-center gap-4">
                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${result.seoScore > 90 ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                      <span className="text-[10px] font-black uppercase text-slate-400">SEO</span>
                      <span className={`text-xl font-black ${result.seoScore > 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>{result.seoScore}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.generator.metaDesc}</p>
                      <p className="text-sm font-bold text-slate-600 italic">"{result.metaDescription.substring(0, 80)}..."</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                       <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                       <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Alchimie Auto</span>
                    </div>
                    <button className="p-3 bg-white text-slate-900 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-16 prose prose-indigo max-w-none relative">
                  <h1 className="text-5xl font-black text-slate-900 mb-10 leading-[1.1] tracking-tight">{result.title}</h1>
                  <div className="whitespace-pre-wrap text-slate-600 leading-[1.8] text-xl font-medium tracking-tight font-serif italic mb-10">
                    {result.content}
                  </div>
                </div>
              </div>

              {/* Alchemy Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Hero Image Block */}
                 <div className="bg-white border border-slate-100 rounded-[32px] p-2 shadow-lg overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 bg-slate-100 rounded-[28px] relative overflow-hidden">
                      {isAlchemistWorking ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                           <Loader2 className="w-10 h-10 animate-spin mb-4" />
                           <span className="text-[10px] font-black tracking-widest uppercase">{t.generator.painting}</span>
                        </div>
                      ) : heroImage ? (
                        <img src={heroImage} alt="AI Hero" className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <ImageIcon className="w-20 h-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t.generator.heroTitle}</span>
                      {heroImage && <button onClick={() => copyToClipboard(heroImage, 'hero')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><Copy className="w-4 h-4 text-slate-400" /></button>}
                    </div>
                 </div>

                 {/* Social Pack Block */}
                 <div className="bg-slate-900 text-white border border-slate-800 rounded-[32px] p-8 shadow-2xl flex flex-col relative overflow-hidden h-[400px]">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-[60px] -mr-20 -mt-20"></div>
                    <div className="flex items-center gap-3 mb-8">
                      <Instagram className="w-6 h-6 text-pink-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-pink-500">{t.generator.instaPack}</span>
                    </div>
                    <div className="space-y-6 flex-1 relative z-10 overflow-y-auto custom-scrollbar">
                      {isAlchemistWorking ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-30">
                           <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Remixing...</span>
                         </div>
                      ) : socialRemix?.instagramPost ? (
                        <>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl italic text-sm font-medium text-white/80 leading-relaxed">
                            <span className="text-[9px] font-black uppercase text-white/30 block mb-2 tracking-widest">Suggestion Visuelle</span>
                            {socialRemix.instagramPost.visualSuggestion}
                          </div>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-xs text-white font-mono leading-relaxed group relative">
                            <span className="text-[9px] font-black uppercase text-white/30 block mb-2 tracking-widest">Légende</span>
                            {socialRemix.instagramPost.caption}
                            <button 
                              onClick={() => copyToClipboard(socialRemix.instagramPost.caption, 'insta')}
                              className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center opacity-10">
                           <Sparkles className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[40px] h-[700px] flex flex-col items-center justify-center p-20 text-center transition-all hover:border-indigo-100 hover:bg-slate-50/30 group">
              <div className="bg-slate-50 p-10 rounded-[40px] mb-8 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500">
                <Layout className="w-16 h-16 text-slate-200 group-hover:text-indigo-200 transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-slate-300 group-hover:text-slate-400 transition-colors">{t.generator.readyTitle}</h3>
              <p className="text-slate-300 max-w-xs text-lg font-medium mt-4 group-hover:text-slate-400">{t.generator.readyDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
