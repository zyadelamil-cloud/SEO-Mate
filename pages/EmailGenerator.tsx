
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Target, 
  MessageSquare,
  RefreshCw,
  Mail,
  Zap,
  AlignLeft,
  Lock,
  ArrowUpCircle,
  ChevronRight,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateProfessionalEmail } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { usePlan } from '../context/PlanContext';
import { useContent } from '../context/ContentContext';
import { PlanType, GeneratedEmail } from '../types';

const EmailGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { isLanguageAvailable, getPlanRequirement, getWordCountLimits, absoluteMax, plan } = usePlan();
  const { addItem } = useContent();
  const limits = getWordCountLimits();

  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState('');
  const [target, setTarget] = useState('');
  const [tone, setTone] = useState('Professional');
  const [goal, setGoal] = useState('Meeting Request');
  const [language, setLanguage] = useState('English');
  const [wordCount, setWordCount] = useState(150);
  const [result, setResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (wordCount > limits.email) {
      setWordCount(limits.email);
    }
  }, [limits.email]);

  const languageKeys = [
    'English', 'French', 'Spanish', 'German', 'Arabic', 'Chinese',
    'Hindi', 'Bengali', 'Russian', 'Portuguese'
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!context || !target) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const data = await generateProfessionalEmail(context, target, tone, goal, language, wordCount);
      
      const fullEmail: GeneratedEmail = {
        id: crypto.randomUUID(),
        type: 'email',
        target,
        context,
        subjects: data.subjects,
        body: data.body,
        createdAt: new Date().toISOString(),
        language,
        tone
      };

      setResult(fullEmail);
      addItem(fullEmail);
    } catch (error) {
      console.error(error);
      alert('Email generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isAtLimit = wordCount >= limits.email;

  const emailPresets = [
    { label: 'Court', value: 100 },
    { label: 'Standard', value: 250 },
    { label: 'Détaillé', value: 500 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          {t.email.title} <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">{t.email.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50"></div>
            
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> 1. DESTINATAIRE
              </label>
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={t.email.targetPlaceholder}
                className="w-full p-4 border border-slate-100 rounded-2xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> 2. CONTEXTE
              </label>
              <textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t.email.contextPlaceholder}
                className="w-full p-4 border border-slate-100 rounded-2xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-6 py-4 border-t border-slate-50">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600" /> 3. LONGUEUR
                </label>
                <div className="text-right">
                  <span className={`text-2xl font-black ${isAtLimit ? 'text-amber-500' : 'text-indigo-600'}`}>{wordCount}</span>
                  <span className="text-[10px] font-black text-slate-300 ml-1 uppercase">Mots</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {emailPresets.map((p) => {
                  const isLocked = p.value > limits.email;
                  const isActive = wordCount === p.value;
                  return (
                    <button
                      key={p.label}
                      disabled={isLocked}
                      onClick={() => setWordCount(p.value)}
                      className={`p-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                        isLocked 
                        ? 'opacity-30 bg-slate-50 border-slate-50 cursor-not-allowed' 
                        : isActive
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative h-6 flex items-center">
                <input 
                  type="range"
                  min="50"
                  max={absoluteMax.email}
                  step="10"
                  value={wordCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= limits.email) setWordCount(val);
                  }}
                  className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-600 bg-slate-100`}
                />
                <div 
                  className="absolute h-full w-1 bg-slate-300 rounded-full pointer-events-none" 
                  style={{ left: `${(limits.email / absoluteMax.email) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                 <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Langue</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold bg-slate-50 outline-none cursor-pointer"
                  >
                    {languageKeys.map(key => {
                      const isAvailable = isLanguageAvailable(key);
                      const reqPlan = getPlanRequirement(key);
                      const label = (t.common.languages as any)[key] || key;
                      return (
                        <option key={key} value={key} disabled={!isAvailable}>
                          {label} {!isAvailable && reqPlan ? `(${reqPlan})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {isAtLimit && plan !== PlanType.PREMIUM && (
                <Link to="/billing" className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-2xl group transition-all hover:bg-amber-100 mt-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-amber-600 fill-current" />
                    <span className="text-[9px] font-black text-amber-900 uppercase">Améliorer la limite</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                </Link>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !context || !target}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              {t.email.generateBtn}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-white border border-slate-100 rounded-[40px] h-[600px] flex flex-col items-center justify-center text-center p-20 animate-pulse shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-8">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
              <h3 className="text-xl font-black uppercase">{t.email.drafting}</h3>
              <p className="text-slate-400 font-medium max-w-xs">{t.email.draftingDesc}</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm space-y-8">
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-500" /> OBJETS RECOMMANDÉS
                  </h3>
                  <div className="space-y-3">
                    {result.subjects.map((sub: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-all">
                        <span className="text-sm font-bold text-slate-700">{sub}</span>
                        <button 
                          onClick={() => copyToClipboard(sub, `sub-${i}`)}
                          className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                        >
                          {copiedId === `sub-${i}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CORPS DU MESSAGE</h3>
                    <button 
                      onClick={() => copyToClipboard(result.body, 'body')}
                      className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase hover:underline"
                    >
                      {copiedId === 'body' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      COPIER LE MESSAGE
                    </button>
                  </div>
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 min-h-[300px]">
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-lg italic">
                      {result.body}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[40px] h-[600px] flex flex-col items-center justify-center text-center p-20 group hover:bg-slate-50/30 transition-all">
              <div className="bg-slate-50 p-10 rounded-[40px] mb-8 group-hover:scale-110 group-hover:bg-amber-50 transition-all">
                <Mail className="w-16 h-16 text-slate-200 group-hover:text-amber-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-300 group-hover:text-slate-400">{t.email.readyTitle}</h3>
              <p className="text-slate-300 max-w-xs font-medium mt-4 group-hover:text-slate-400">{t.email.readyDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
