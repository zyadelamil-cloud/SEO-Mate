
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Mail,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserSubscription } from '../types';

interface AccountProps {
  subscription: UserSubscription;
  setSubscription: (sub: UserSubscription) => void;
}

const Account: React.FC<AccountProps> = ({ subscription, setSubscription }) => {
  const [name, setName] = useState(subscription.firstName);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSubscription({ ...subscription, firstName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mon Compte</h1>
          <p className="text-slate-500 font-medium mt-2">Personnalisez votre identité et gérez votre accès.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Enregistré' : 'Sauvegarder'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-full bg-slate-900 text-white flex items-center justify-center text-5xl font-black shadow-3xl mb-8 mx-auto border-8 border-white group-hover:bg-indigo-600 transition-all duration-500 group-hover:scale-110">
                  {initial}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{subscription.firstName || 'Utilisateur'}</h3>
                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-2 px-4 py-1.5 bg-indigo-50 rounded-full inline-block">
                  Membre {subscription.planName}
                </p>
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-6 w-full">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Articles</p>
                      <p className="text-xl font-black text-slate-900">{subscription.usedArticles}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score SEO</p>
                      <p className="text-xl font-black text-slate-900">92%</p>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">Badges & Récompenses</h3>
                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all"><Trophy className="w-6 h-6 text-yellow-400" /></div>
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Zap className="w-6 h-6 text-indigo-400" /></div>
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-2xl space-y-10">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-900 text-white rounded-2xl"><UserIcon className="w-6 h-6" /></div>
                <div>
                   <h3 className="text-xl font-black text-slate-900">Informations Personnelles</h3>
                   <p className="text-sm text-slate-400 font-bold">Ces informations sont visibles uniquement par vous.</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Modifier le Prénom</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ton prénom"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-lg font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-inner"
                   />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 grayscale cursor-not-allowed">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">Email <ShieldCheck className="w-3 h-3" /></label>
                      <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                         <input disabled value="contact@premium.com" className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-sm font-bold outline-none" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">Mobile <Smartphone className="w-3 h-3" /></label>
                      <input disabled value="+33 6 00 00 00 00" className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-sm font-bold outline-none" />
                   </div>
                </div>
             </div>
          </section>

          <div className="bg-indigo-600 rounded-[48px] p-10 text-white flex items-center justify-between shadow-3xl">
             <div>
                <h3 className="text-2xl font-black tracking-tighter">Prêt pour le niveau supérieur ?</h3>
                <p className="text-white/60 font-bold text-sm mt-1">Passez au pack Elite pour des articles illimités.</p>
             </div>
             <button className="px-8 py-4 bg-white text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Upgrade Pro</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
