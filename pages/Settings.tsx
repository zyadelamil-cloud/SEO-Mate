
import React, { useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Languages
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-slate-500">{t.settings.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Language Selector Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t.settings.languageTitle}</h3>
                <p className="text-sm text-slate-500">{t.settings.languageDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  language === 'en' 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-bold text-slate-700">English</span>
                </div>
                {language === 'en' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </button>
              <button 
                onClick={() => setLanguage('fr')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  language === 'fr' 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇫🇷</span>
                  <span className="font-bold text-slate-700">Français</span>
                </div>
                {language === 'fr' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t.settings.apiTitle}</h3>
                <p className="text-sm text-slate-500">{t.settings.apiDesc}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold">Default SEO Logic</p>
                  <p className="text-xs text-slate-500">Use Gemini 3 Pro for all generations by default.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold">Auto-Keyword Selection</p>
                  <p className="text-xs text-slate-500">Automatically find relevant keywords if none provided.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Usage Credits</h3>
              <p className="text-3xl font-bold mb-4">673 <span className="text-sm font-normal opacity-60">tokens</span></p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs opacity-80">
                  <span>This month's quota</span>
                  <span>67% used</span>
                </div>
                <div className="w-full bg-indigo-800 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full w-2/3"></div>
                </div>
              </div>
              <button className="w-full py-2 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                Top up credits
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-800 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
