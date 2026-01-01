
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import EmailGenerator from './pages/EmailGenerator';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Account from './pages/Account';
import Auth from './pages/Auth';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PlanProvider, usePlan } from './context/PlanContext';
import { ContentProvider, useContent } from './context/ContentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlanType } from './types';
import { 
  LayoutDashboard, 
  PenTool, 
  Library as LibraryIcon, 
  Settings as SettingsIcon,
  CreditCard,
  Zap,
  Mail,
  ChevronRight,
  Crown,
  LogOut,
  X,
  AlertTriangle,
  User as UserIcon,
  Loader2
} from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { plan } = usePlan();
  const { stats } = useContent();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const menuItems = [
    { path: '/', label: t.sidebar.dashboard, icon: LayoutDashboard },
    { path: '/generate', label: t.sidebar.generate, icon: PenTool },
    { path: '/email', label: t.sidebar.email, icon: Mail },
    { path: '/library', label: t.sidebar.library, icon: LibraryIcon },
    { path: '/billing', label: t.sidebar.billing, icon: CreditCard },
    { path: '/settings', label: t.sidebar.settings, icon: SettingsIcon },
  ];

  const getPlanStyles = () => {
    switch(plan) {
      case PlanType.PREMIUM: return "from-amber-500 to-orange-600 shadow-amber-200/50";
      case PlanType.PRO: return "from-indigo-600 to-blue-700 shadow-indigo-200/50";
      default: return "from-slate-700 to-slate-900 shadow-slate-200/50";
    }
  };

  return (
    <>
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900">SEO-MATE</h1>
              <p className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">AI Content Forge</p>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4">
          <Link
            to="/account"
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              location.pathname === '/account'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserIcon className={`w-5 h-5 transition-colors ${location.pathname === '/account' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {t.sidebar.account || 'Mon Compte'}
            </div>
            {location.pathname === '/account' && <ChevronRight className="w-4 h-4" />}
          </Link>

          <Link to="/account" className="flex items-center justify-between px-2 group mt-2 pt-2 border-t border-slate-50">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{user?.name}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLogoutConfirm(true);
                    }} 
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-2 h-2" /> Déconnexion
                  </button>
                </div>
             </div>
          </Link>

          <div className={`rounded-2xl p-5 text-white shadow-xl bg-gradient-to-br transition-all duration-500 ${getPlanStyles()}`}>
            <div className="flex items-center gap-2 mb-3">
              {plan === PlanType.PREMIUM && <Crown className="w-4 h-4 fill-current" />}
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{plan} ACCESS</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-bold opacity-90">{stats.totalArticles} {t.sidebar.articlesCount}</span>
                <span className="text-[10px] opacity-70">
                  {plan === PlanType.PREMIUM ? 'Unlimited' : plan === PlanType.PRO ? 'PRO quota' : `${stats.totalArticles} / 3`}
                </span>
              </div>
              <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: plan === PlanType.PREMIUM ? '100%' : plan === PlanType.PRO ? '60%' : `${(stats.totalArticles / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <Link 
              to="/billing" 
              className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
            >
              {plan === PlanType.PREMIUM ? 'View Perks' : t.sidebar.upgrade}
            </Link>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">Se déconnecter ?</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                Êtes-vous sûr de vouloir quitter votre session ? Votre travail en cours pourrait ne pas être sauvegardé.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
                >
                  Oui, me déconnecter
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlanProvider>
        <ContentProvider>
          <LanguageProvider>
            <HashRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen bg-[#F8FAFC]">
                      <Sidebar />
                      <main className="flex-1 p-10 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/generate" element={<Generator />} />
                            <Route path="/email" element={<EmailGenerator />} />
                            <Route path="/library" element={<Library />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/billing" element={<Billing />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
              </Routes>
            </HashRouter>
          </LanguageProvider>
        </ContentProvider>
      </PlanProvider>
    </AuthProvider>
  );
};

export default App;
