
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import ImageStudio from './pages/ImageStudio';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Login from './pages/Login';
import Account from './pages/Account';
import { UserSubscription, GeneratedArticle } from './types';
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
  Sparkles,
  CheckCircle2,
  X,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
  { path: '/generate', label: 'Forge SEO', icon: PenTool },
  { path: '/images', label: 'Studio Image', icon: ImageIcon },
  { path: '/library', label: 'Bibliothèque', icon: LibraryIcon },
  { path: '/billing', label: 'Facturation', icon: CreditCard },
  { path: '/settings', label: 'Configuration', icon: SettingsIcon },
  { path: '/account', label: 'Compte', icon: UserIcon },
];

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

const Sidebar = ({ subscription, onLogout }: { subscription: UserSubscription; onLogout: () => void }) => {
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const usagePercent = subscription.articlesLimit === Infinity ? 0 : (subscription.usedArticles / subscription.articlesLimit) * 100;
  const initial = subscription.firstName ? subscription.firstName.charAt(0).toUpperCase() : '?';

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[40px] shadow-4xl overflow-hidden border border-slate-100 p-10 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Déconnexion</h3>
            <p className="text-slate-500 font-medium text-sm mb-8">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onLogout}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95"
              >
                Oui, me déconnecter
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Annuler
              </button>
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
              <p className="text-xs font-black text-slate-900 truncate">{subscription.firstName || 'Utilisateur'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mon Profil</p>
            </div>
          </Link>

          <button 
            onClick={() => setShowConfirm(true)} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Déconnexion
          </button>

          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Plan {subscription.planName}</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
              <div className="bg-indigo-500 h-1.5 rounded-full shadow-[0_0_8px_#6366f1] transition-all duration-1000" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs opacity-90">{subscription.usedArticles} / {subscription.articlesLimit === Infinity ? '∞' : subscription.articlesLimit}</p>
              <Link to="/billing" className="text-[10px] bg-white text-slate-900 px-2 py-0.5 rounded font-bold hover:bg-indigo-50">BOOST</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('seomate_auth') === 'true');
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('seomate_sub');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION;
  });
  const [articles, setArticles] = useState<GeneratedArticle[]>(() => {
    const saved = localStorage.getItem('seomate_articles');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('seomate_sub', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('seomate_articles', JSON.stringify(articles));
  }, [articles]);

  const handleLogin = (firstName: string) => {
    setSubscription(prev => ({ ...prev, firstName }));
    setIsAuthenticated(true);
    localStorage.setItem('seomate_auth', 'true');
    localStorage.setItem('seomate_last_user', firstName);
    setToastMessage(`Bienvenue, ${firstName} !`);
  };

  const onSaveArticle = (article: GeneratedArticle) => {
    setArticles(prev => [article, ...prev]);
    setSubscription(prev => ({
      ...prev,
      usedArticles: prev.usedArticles + 1
    }));
    setToastMessage("Article forgé et enregistré !");
  };

  const onDeleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setToastMessage("Article supprimé.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false); 
    localStorage.removeItem('seomate_auth');
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 pb-16 md:pb-0 animate-app-reveal">
        <Sidebar subscription={subscription} onLogout={handleLogout} />
        
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard subscription={subscription} articles={articles} />} />
              <Route path="/generate" element={<Generator subscription={subscription} onSaveArticle={onSaveArticle} />} />
              <Route path="/images" element={<ImageStudio subscription={subscription} />} />
              <Route path="/library" element={<Library articles={articles} onDelete={onDeleteArticle} subscription={subscription} />} />
              <Route path="/billing" element={<Billing subscription={subscription} setSubscription={setSubscription} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<Account subscription={subscription} setSubscription={setSubscription} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
