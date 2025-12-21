
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Zap,
  Sparkles,
  History,
  Activity,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { UserSubscription, GeneratedArticle } from '../types';

interface DashboardProps {
  subscription: UserSubscription;
  articles: GeneratedArticle[];
  t: any;
}

const StatCard = ({ title, value, icon: Icon, trend, colorClass = "bg-slate-900" }: any) => (
  <div className="glass p-10 rounded-[56px] border border-white shadow-2xl transition-all duration-700 hover:scale-[1.05] group">
    <div className="flex justify-between items-start mb-10">
      <div className={`p-6 ${colorClass} rounded-[28px] text-white shadow-lg group-hover:scale-110 transition-all`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-widest bg-green-100 text-green-700">
        ↑ {trend}%
      </div>
    </div>
    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] mb-3">{title}</p>
    <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ subscription, articles, t }) => {
  const navigate = useNavigate();
  const usagePercent = subscription.articlesLimit === Infinity ? 0 : (subscription.usedArticles / subscription.articlesLimit) * 100;
  
  const avgSeoScore = articles.length > 0 
    ? Math.round(articles.reduce((acc, curr) => acc + curr.seoScore, 0) / articles.length)
    : 0;

  return (
    <div className="space-y-16 pb-32 animate-in fade-in duration-1000">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
            {t.dash_welcome}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-900 italic">{subscription.firstName || 'Expert'}</span>
          </h1>
          <p className="text-slate-400 font-semibold text-2xl mt-6 opacity-70">{t.dash_subtitle} • {t.nav_plan} {subscription.planName}</p>
        </div>
        <button onClick={() => navigate('/generate')} className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all group active:scale-95">
          <Sparkles className="w-5 h-5 group-hover:rotate-12" /> {t.dash_new_gen}
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard title={t.dash_stat_articles} value={articles.length} icon={FileText} trend={12} colorClass="bg-slate-900" />
        <StatCard title={t.dash_stat_seo} value={`${avgSeoScore}%`} icon={Award} trend={5} colorClass="bg-indigo-600" />
        <StatCard title={t.dash_stat_words} value={`${articles.length * 1200}`} icon={Activity} trend={8} colorClass="bg-purple-600" />
        <StatCard title={t.dash_stat_quota} value={subscription.articlesLimit === Infinity ? '∞' : Math.max(0, subscription.articlesLimit - subscription.usedArticles)} icon={Zap} trend={2} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-slate-950 p-12 rounded-[64px] text-white shadow-4xl relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] group-hover:scale-125 transition-all duration-1000"></div>
          <div className="relative z-10 space-y-12">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 mb-4">{t.dash_analysis}</h3>
                <div className="flex items-baseline gap-4">
                  <p className="text-8xl font-black tracking-tighter">{Math.min(usagePercent, 100).toFixed(0)}%</p>
                  <span className="text-indigo-500 font-black text-xl uppercase italic">{t.dash_used}</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-indigo-500/50" />
            </div>
            
            <div className="space-y-4">
              <div className="w-full bg-slate-900 rounded-full h-8 p-2 shadow-inner">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 h-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-2000" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[64px] shadow-3xl border border-white overflow-hidden flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-10">
            <History className="w-6 h-6 text-indigo-600" /> {t.dash_flux}
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
             {articles.slice(0, 6).map(a => (
               <div key={a.id} className="p-5 rounded-[28px] bg-white border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => navigate('/library')}>
                 <div className="flex justify-between items-start gap-3">
                   <p className="font-black text-slate-900 text-xs truncate group-hover:text-indigo-600 flex-1">{a.title}</p>
                   <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{a.seoScore}%</span>
                 </div>
                 <div className="flex items-center gap-3 mt-3 opacity-40">
                   <Clock className="w-3 h-3" />
                   <p className="text-[8px] uppercase font-bold tracking-widest">{a.createdAt} • {a.lang}</p>
                 </div>
               </div>
             ))}
             {articles.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                  <FileText className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t.dash_no_art}</p>
               </div>
             )}
          </div>
          <button onClick={() => navigate('/library')} className="mt-8 w-full py-4 border-2 border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">
            {t.dash_view_all}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
