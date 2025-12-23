
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import Generator from './pages/Generator.tsx';
import ImageStudio from './pages/ImageStudio.tsx';
import Library from './pages/Library.tsx';
import Settings from './pages/Settings.tsx';
import Billing from './pages/Billing.tsx';
import Login from './pages/Login.tsx';
import Account from './pages/Account.tsx';
import { UserSubscription, GeneratedArticle, GeneratedImage } from './types.ts';
import { translations } from './services/i18n.ts';
import { supabase } from './services/supabase.ts';
import { 
  LayoutDashboard, 
  PenTool, 
  Library as LibraryIcon, 
  Settings as SettingsIcon,
  CreditCard,
  Zap,
  TrendingUp,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planName: 'Starter',
  level: 0,
  articlesLimit: 3,
  usedArticles: 0,
  firstName: '',
  features: {
    heroImages: false,
    socialPack: false,
    bulkMode: false,
    prioritySupport: false
  }
};

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 right-8 z-[500] bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-4xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border border-indigo-500/30">
      <CheckCircle2 className="w-6 h-6 text-green-400" />
      <span className="font-black text-xs uppercase tracking-widest">{message}</span>
    </div>
  );
};

const Sidebar = ({ subscription, onLogout, t }: { subscription: UserSubscription; onLogout: () => void; t: any }) => {
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const usagePercent = subscription.articlesLimit === Infinity ? 0 : (subscription.usedArticles / subscription.articlesLimit) * 100;
  const initial = subscription.firstName ? subscription.firstName.charAt(0).toUpperCase() : '?';

  const menuItems = [
    { path: '/', label: t.nav_dashboard, icon: LayoutDashboard },
    { path: '/generate', label: t.nav_forge, icon: PenTool },
    { path: '/images', label: t.nav_studio, icon: ImageIcon },
    { path: '/library', label: t.nav_library, icon: LibraryIcon },
    { path: '/billing', label: t.nav_billing, icon: CreditCard },
    { path: '/settings', label: t.nav_settings, icon: SettingsIcon },
    { path: '/account', label: t.nav_account, icon: UserIcon },
  ];

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[40px] shadow-4xl overflow-hidden border border-slate-100 p-10 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{t.nav_logout}</h3>
            <p className="text-slate-500 font-medium text-sm mb-8">Confirmer la déconnexion ?</p>
            <div className="flex flex-col gap-3">
              <button onClick={onLogout} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95">Oui</button>
              <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Non</button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-slate-900 p-2 rounded-lg shadow-lg">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SEO-Mate</span>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 space-y-3">
          <Link to="/account" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all group">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{subscription.firstName || 'Expert'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.nav_account}</p>
            </div>
          </Link>

          <button onClick={() => setShowConfirm(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group">
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t.nav_logout}
          </button>

          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">{t.nav_plan} {subscription.planName}</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
              <div className="bg-indigo-500 h-1.5 rounded-full shadow-[0_0_8px_#6366f1] transition-all duration-1000" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs opacity-90">{subscription.usedArticles} / {subscription.articlesLimit === Infinity ? '∞' : subscription.articlesLimit}</p>
              <Link to="/billing" className="text-[10px] bg-white text-slate-900 px-2 py-0.5 rounded font-bold hover:bg-indigo-50">{t.nav_boost}</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    try {
      const savedApi = localStorage.getItem('seomate_api');
      return savedApi ? JSON.parse(savedApi).siteLanguage || 'fr' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const t = useMemo(() => translations[lang], [lang]);
  const [subscription, setSubscription] = useState<UserSubscription>(DEFAULT_SUBSCRIPTION);
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        setSubscription(DEFAULT_SUBSCRIPTION);
        setArticles([]);
        setImageHistory([]);
      }
      setLoading(false);
    });

    return () => authListener.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Si le profil n'existe pas, on le crée
      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          plan_name: DEFAULT_SUBSCRIPTION.planName,
          level: DEFAULT_SUBSCRIPTION.level,
          articles_limit: DEFAULT_SUBSCRIPTION.articlesLimit,
          used_articles: 0,
          first_name: session?.user?.user_metadata?.first_name || 'Expert',
          features: DEFAULT_SUBSCRIPTION.features
        };
        const { data: createdProfile } = await supabase.from('profiles').insert([newProfile]).select().single();
        profile = createdProfile;
      }

      if (profile) {
        setSubscription({
          planName: profile.plan_name,
          level: profile.level,
          articlesLimit: profile.articles_limit,
          usedArticles: profile.used_articles || 0,
          firstName: profile.first_name,
          features: profile.features || DEFAULT_SUBSCRIPTION.features
        });
      }

      const { data: userArticles } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userArticles) {
        setArticles(userArticles.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          metaDescription: a.meta_description,
          hashtags: a.hashtags,
          seoScore: a.seo_score,
          status: a.status,
          lang: a.lang,
          createdAt: new Date(a.created_at).toLocaleDateString(),
          timestamp: new Date(a.created_at).getTime()
        })));
      }

      const { data: userImages } = await supabase
        .from('images_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userImages) {
        setImageHistory(userImages.map(img => ({
          id: img.id,
          prompt: img.prompt,
          url: img.url,
          createdAt: new Date(img.created_at).toLocaleDateString()
        })));
      }
    } catch (err) {
      console.error("Erreur de chargement profil:", err);
    }
  };

  const onSaveArticle = async (article: GeneratedArticle) => {
    if (!session) return;
    
    const dbArticle = {
      user_id: session.user.id,
      title: article.title,
      content: article.content,
      meta_description: article.metaDescription,
      hashtags: article.hashtags,
      seo_score: article.seoScore,
      status: article.status,
      lang: article.lang
    };

    const { data, error } = await supabase.from('articles').insert([dbArticle]).select().single();
    
    if (data) {
      setArticles(prev => [{...article, id: data.id}, ...prev]);
      const newUsed = subscription.usedArticles + 1;
      setSubscription(prev => ({ ...prev, usedArticles: newUsed }));
      await supabase.from('profiles').update({ used_articles: newUsed }).eq('id', session.user.id);
      setToastMessage(lang === 'fr' ? "Enregistré avec succès !" : "Saved successfully!");
    }
  };

  const onSaveImage = async (prompt: string, url: string) => {
    if (!session) return;
    const { data } = await supabase.from('images_history').insert([{
      user_id: session.user.id,
      prompt,
      url
    }]).select().single();

    if (data) {
      setImageHistory(prev => [{
        id: data.id,
        prompt: data.prompt,
        url: data.url,
        createdAt: new Date(data.created_at).toLocaleDateString()
      }, ...prev]);
    }
  };

  const onDeleteArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (!error) {
      setArticles(prev => prev.filter(a => a.id !== id));
      setToastMessage(lang === 'fr' ? "Supprimé." : "Deleted.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
       <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  if (!session) return <Login onLogin={() => {}} />;

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 pb-16 md:pb-0 animate-app-reveal">
        <Sidebar subscription={subscription} onLogout={handleLogout} t={t} />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard subscription={subscription} articles={articles} t={t} />} />
              <Route path="/generate" element={<Generator subscription={subscription} onSaveArticle={onSaveArticle} t={t} />} />
              <Route path="/images" element={<ImageStudio subscription={subscription} t={t} history={imageHistory} onSaveImage={onSaveImage} />} />
              <Route path="/library" element={<Library articles={articles} onDelete={onDeleteArticle} subscription={subscription} t={t} />} />
              <Route path="/billing" element={<Billing subscription={subscription} setSubscription={setSubscription} t={t} />} />
              <Route path="/settings" element={<Settings onLanguageChange={setLang} t={t} />} />
              <Route path="/account" element={<Account subscription={subscription} setSubscription={setSubscription} t={t} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
