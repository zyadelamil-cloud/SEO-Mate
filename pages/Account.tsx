
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Mail,
  Trophy,
  Zap,
  Loader2
} from 'lucide-react';
import { UserSubscription } from '../types';
import { supabase } from '../services/supabase';

interface AccountProps {
  subscription: UserSubscription;
  setSubscription: (sub: UserSubscription) => void;
  t: any;
}

const Account: React.FC<AccountProps> = ({ subscription, setSubscription, t }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(subscription.firstName);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: name })
        .eq('id', session.user.id);
      
      if (!error) {
        setSubscription({ ...subscription, firstName: name });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    }
    setLoading(false);
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{t.acc_title}</h1>
          <p className="text-slate-500 font-medium mt-2">{t.acc_subtitle}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
          {saved ? t.acc_saved : t.acc_save}
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
                  {t.acc_member} {subscription.planName}
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
                   <h3 className="text-xl font-black text-slate-900">{t.acc_personal}</h3>
                   <p className="text-sm text-slate-400 font-bold">Ces informations sont visibles uniquement par vous.</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.acc_first_name}</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ton prénom"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-lg font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-inner"
                   />
                </div>
             </div>
          </section>

          <div className="bg-indigo-600 rounded-[48px] p-10 text-white flex items-center justify-between shadow-3xl">
             <div>
                <h3 className="text-2xl font-black tracking-tighter">{t.acc_ready_next}</h3>
                <p className="text-white/60 font-bold text-sm mt-1">Passez au pack Elite pour des articles illimités.</p>
             </div>
             <button 
                onClick={() => navigate('/billing')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                {t.acc_upgrade}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
