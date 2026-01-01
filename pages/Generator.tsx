
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
  ChevronRight,
  AlertCircle
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

  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  
  const [config, setConfig] = useState<SEOConfig>({
    targetKeywords: [],
    language: 'English',
    tone: 'Professional',
    wordCount: 1200,
    includeMeta: true,
    audience: 'General'
  });

  const [result, setResult] = useState<GeneratedArticle | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [socialRemix, setSocialRemix] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (config.wordCount > limits.article) {
      setConfig(prev => ({ ...prev, wordCount: limits.article }));
    }
  }, [limits.article]);

  const handleSuggestKeywords = async () => {
    if (!topic) return;
    setIsSuggesting(true);
    try {
      const suggested = await suggestKeywords(topic);
      setKeywords(prev => [...new Set([...prev, ...suggested])]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setResult(null);
    setHeroImage(null);
    setSocialRemix(null);

    try {
      const seoConfig = { ...config, targetKeywords: keywords };
      const model = plan === PlanType.BASIC ? AIModelType.FAST : AIModelType.PRO;
      const data = await generateSEOArticle(topic, seoConfig, model);
      
      const newArticle: GeneratedArticle = {
        id: crypto.randomUUID(),
        type: 'article',
        title: data.title,
        content: data.content,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        status: 'draft',
        createdAt: new Date().toISOString(),
        seoScore: data.seoScore,
        model: model,
        language: config.language
      };

      setResult(newArticle);
      await addItem(newArticle);
    } catch (error) {
      console.error(error);
      alert('Failed to generate article.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!result) return;
    setIsPainting(true);
    try {
      const img = await generateHeroImage(topic, result.title);
      setHeroImage(img);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPainting(false);
    }
  };

  const handleRemix = async () => {
    if (!result) return;
    setIsRemixing(true);
    try {
      const remix = await remixForSocial(result.content);
      setSocialRemix(remix);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRemixing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tones = ['Professional', 'Informative', 'Casual', 'Witty', 'Urgent'];
  const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Arabic'];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          {t.generator.title} <Zap className="w-8 h-8 text-indigo-600 fill-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">{t.generator.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-600" /> 1. SUJET
              </label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.generator.placeholderTopic}
                className="w-full p-4 border border-slate-100 rounded-2xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[100px] resize-none"
              />
              <button 
                onClick={handleSuggestKeywords}
                disabled={isSuggesting || !topic}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50"
              >
                {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {t.generator.suggest}
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" /> 2. MOTS-CLÉS
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  className="flex-1 p-3 border border-slate-100 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white outline-none"
                  placeholder="Ajouter un mot-clé..."
                />
                <button 
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {keywords.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-2">
                    {kw}
                    <button onClick={() => setKeywords(keywords.filter(k => k !== kw))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600" /> 3. LONGUEUR
                </label>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{config.wordCount}</span>
                  <span className="text-[10px] font-black text-slate-300 ml-1 uppercase">Mots</span>
                </div>
              </div>

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
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-600 bg-slate-100"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Langue</label>
                  <select 
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold bg-slate-50 outline-none"
                  >
                    {languages.map(l => (
                      <option key={l} value={l} disabled={!isLanguageAvailable(l)}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ton</label>
                  <select 
                    value={config.tone}
                    onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                    className="w-full p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold bg-slate-50 outline-none"
                  >
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
              {t.generator.generateBtn}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-white border border-slate-100 rounded-[40px] h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 animate-pulse">
              <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-8">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
              <h3 className="text-xl font-black uppercase">{t.generator.forging}</h3>
              <p className="text-slate-400 font-medium max-w-xs">{t.generator.wait}</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">{result.title}</h2>
                    <div className="flex gap-2 mt-4">
                      {result.keywords.map(kw => (
                        <span key={kw} className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase">#{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white text-center shadow-lg shadow-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">SEO SCORE</p>
                    <p className="text-3xl font-black">{result.seoScore}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description Expert</p>
                   <p className="text-sm font-bold text-slate-600 italic">"{result.metaDescription}"</p>
                </div>

                <div className="prose prose-indigo max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-lg">
                    {result.content}
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 flex gap-4">
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isPainting || !!heroImage}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isPainting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {t.generator.heroTitle}
                  </button>
                  <button 
                    onClick={handleRemix}
                    disabled={isRemixing || !!socialRemix}
                    className="flex-1 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {isRemixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Social Remix
                  </button>
                </div>
              </div>

              {heroImage && (
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Article Hero Image</p>
                   <img src={heroImage} alt="Hero" className="w-full h-auto rounded-2xl shadow-lg" />
                </div>
              )}

              {socialRemix && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-700">
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-pink-600">
                      <Instagram className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{socialRemix.instagramPost.visualSuggestion}"</p>
                    <p className="text-sm font-bold text-slate-700">{socialRemix.instagramPost.caption}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-sky-500">
                      <Twitter className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">X (Twitter)</span>
                    </div>
                    <div className="space-y-3">
                      {socialRemix.twitterThread.map((t: string, i: number) => (
                        <p key={i} className="text-sm font-bold text-slate-700 p-3 bg-slate-50 rounded-xl">Thread {i+1}: {t}</p>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Linkedin className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{socialRemix.linkedinPost}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[40px] h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 group hover:bg-slate-50/30 transition-all">
              <div className="bg-slate-50 p-10 rounded-[40px] mb-8 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                <Layout className="w-16 h-16 text-slate-200 group-hover:text-indigo-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-300 group-hover:text-slate-400">{t.generator.readyTitle}</h3>
              <p className="text-slate-300 max-w-xs font-medium mt-4 group-hover:text-slate-400">{t.generator.readyDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
