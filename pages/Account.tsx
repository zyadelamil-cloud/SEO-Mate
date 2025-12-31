
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  Loader2,
  Save,
  Zap,
  Activity,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePlan } from '../context/PlanContext';
import { PlanType } from '../types';

const Account: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t, language } = useLanguage();
  const { plan } = usePlan();
  
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === user?.name || !name.trim()) return;
    
    setIsUpdating(true);
    try {
      await updateProfile(name);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Paramètres du Compte</h1>
        <p className="text-slate-500 font-medium">Gérez votre identité SEO-Mate et personnalisez votre expérience.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-10"></div>
             
             <div className="relative z-10 mb-6">
                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-indigo-200 border-8 border-white">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-white shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
             </div>

             <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{plan} MEMBER</p>
             </div>

             <div className="w-full mt-10 space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                   </div>
                   <span className="text-xs font-bold text-slate-700">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre depuis</span>
                   </div>
                   <span className="text-xs font-bold text-slate-700 capitalize">{formatDate(user?.createdAt)}</span>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden group">
             <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/10 rounded-2xl">
                   <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <Activity className="w-6 h-6 text-white/20 group-hover:text-indigo-400 transition-colors" />
             </div>
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Statut du Forgeron</p>
             <div className="flex items-end gap-2">
                <span className="text-2xl font-black uppercase tracking-tight">{plan === PlanType.PREMIUM ? 'Accès Illimité' : 'Forgeron Actif'}</span>
             </div>
             <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
                <div>
                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Articles</p>
                   <p className="text-sm font-black text-emerald-400">Prêt à forger</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">SEO Alchemy</p>
                   <p className="text-sm font-black text-indigo-400">Activé</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Identity Settings */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleUpdate} className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-12 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                     <User className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Informations de profil</h3>
                     <p className="text-sm text-slate-400 font-medium">Modifiez votre nom pour personnaliser vos rapports.</p>
                  </div>
               </div>
               {showSuccess && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 className="w-4 h-4" /> Mis à jour
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Votre Nom</label>
                  <div className="relative group">
                     <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                     <input 
                       type="text"
                       required
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                     />
                  </div>
               </div>
               <div className="space-y-3 opacity-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Adresse Email</label>
                  <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="email"
                       readOnly
                       value={user?.email}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold cursor-not-allowed"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex justify-end">
               <button 
                 type="submit"
                 disabled={isUpdating || name === user?.name || !name.trim()}
                 className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-30 active:scale-95"
               >
                 {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Sauvegarder les changements
               </button>
            </div>
          </form>

          <div className="bg-slate-50 rounded-[40px] border border-slate-100 p-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 text-indigo-600">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Historique des Sessions</h3>
                <p className="text-sm text-slate-500 font-medium">Visualisez vos dernières activités de forgeage.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              Bientôt disponible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
