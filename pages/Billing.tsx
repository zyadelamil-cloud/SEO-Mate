
import React, { useState } from 'react';
import { 
  Check, 
  CreditCard, 
  Plus, 
  Download, 
  ShieldCheck,
  Star,
  Coins,
  Loader2,
  CheckCircle2,
  Activity,
  X,
  Lock,
  Rocket,
  ArrowRight,
  Sparkles,
  Trophy,
  Percent
} from 'lucide-react';
import { UserSubscription } from '../types';

interface BillingProps {
  subscription: UserSubscription;
  setSubscription: (sub: UserSubscription) => void;
  // Fix: Added 't' translation prop
  t: any;
}

const plans = [
  {
    name: 'Starter',
    icon: Activity,
    price: '0',
    oldPrice: null,
    level: 0,
    limit: 3,
    description: 'Parfait pour découvrir la puissance de l\'IA.',
    features: ['3 articles / mois', 'Max 1200 mots par article', 'Français & Anglais Inclus', 'Gemini Flash'],
    config: { heroImages: false, bulkMode: false, prioritySupport: false },
    popular: false
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: '19',
    oldPrice: null,
    level: 1,
    limit: 50,
    description: 'La référence pour les blogueurs et SEO.',
    features: ['50 articles / mois', 'Jusqu\'à 3000 mots (1200+)', 'Espagnol & Europe Inclus', 'Gemini 3 Pro + Images IA'],
    config: { heroImages: true, bulkMode: false, prioritySupport: true },
    popular: false
  },
  {
    name: 'Expert',
    icon: Star,
    price: '39',
    oldPrice: '59',
    level: 2,
    limit: 150,
    description: 'Croissance multilingue maximale.',
    features: ['150 articles / mois', 'Jusqu\'à 6000 mots', 'Toutes les langues IA (Asiatiques, etc)', 'Mode Bulk Intelligent'],
    config: { heroImages: true, bulkMode: true, prioritySupport: true },
    popular: true // Featured plan
  },
  {
    name: 'Elite',
    icon: Coins,
    price: '79',
    oldPrice: '89',
    level: 3,
    limit: Infinity,
    description: 'Infrastructures pour agences et gros volumes.',
    features: ['Articles Illimités', 'Jusqu\'à 12000 mots', 'Support VIP Dédié', 'Multi-utilisateurs'],
    config: { heroImages: true, bulkMode: true, prioritySupport: true },
    popular: false
  }
];

const PaymentModal = ({ plan, onClose, onConfirm }: any) => {
  const [loading, setLoading] = useState(false);
  
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(plan);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-4xl overflow-hidden border border-slate-100 animate-in zoom-in duration-500">
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-5/12 bg-slate-50 p-10 flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Votre Commande</h3>
            <div className="flex-1">
              <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Abonnement</p>
                <div className="flex items-center gap-2">
                  <plan.icon className="w-4 h-4 text-slate-400" />
                  <p className="text-xl font-black text-slate-900">{plan.name}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <span className="text-base font-black text-slate-900">Total / mois</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">€{plan.price}.00</span>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-3 text-slate-400 opacity-60">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest">Paiement Sécurisé</span>
            </div>
          </div>

          <div className="flex-1 p-10 relative">
            <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
              <X className="w-5 h-5 text-slate-300" />
            </button>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Détails de Paiement</h3>
            <form onSubmit={handlePayment} className="space-y-6">
              <input required type="text" placeholder="Nom sur la carte" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
              <input required type="text" placeholder="Numéro de carte" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="MM/YY" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                <input required type="text" placeholder="CVC" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 mt-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirmer - €${plan.price}/mois`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Destructured 't' from props
const Billing: React.FC<BillingProps> = ({ subscription, setSubscription, t }) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleConfirmSubscription = (plan: any) => {
    setSubscription({
      ...subscription,
      planName: plan.name,
      level: plan.level,
      articlesLimit: plan.limit,
      features: plan.config
    });
    setSelectedPlan(null);
    setNotification(`Abonnement ${plan.name} activé !`);
    setTimeout(() => setNotification(null), 4000);
  };

  const calculateDiscount = (oldPrice: string | null, newPrice: string) => {
    if (!oldPrice) return null;
    const oldVal = parseFloat(oldPrice);
    const newVal = parseFloat(newPrice);
    return Math.round(((oldVal - newVal) / oldVal) * 100);
  };

  return (
    <div className="space-y-10 pb-20 relative animate-in fade-in duration-700">
      {notification && (
        <div className="fixed top-8 right-8 z-[100] bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-4xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border border-indigo-500/30">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <span className="font-black text-xs uppercase tracking-widest">{notification}</span>
        </div>
      )}

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onConfirm={handleConfirmSubscription} />
      )}

      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{t.bill_title}</h1>
        <p className="text-slate-500 font-medium mt-2">{t.bill_current} : <span className="text-indigo-600 font-black">{subscription.planName}</span></p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {plans.map((plan) => {
          const isActive = subscription.planName === plan.name;
          const isExpert = plan.popular;
          const discount = calculateDiscount(plan.oldPrice, plan.price);

          return (
            <div 
              key={plan.name} 
              className={`relative rounded-[48px] p-8 transition-all flex flex-col group ${
                isExpert 
                  ? 'bg-slate-900 text-white scale-105 z-10 shadow-[0_40px_80px_rgba(79,70,229,0.3)] ring-4 ring-indigo-500/50' 
                  : isActive 
                  ? 'bg-white border-2 border-slate-900 ring-8 ring-slate-50' 
                  : 'bg-white border-2 border-slate-100 hover:border-indigo-200'
              }`}
            >
              {isExpert && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 whitespace-nowrap border-2 border-white/20">
                   <Trophy className="w-4 h-4 text-yellow-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{t.bill_expert_choice}</span>
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      isExpert 
                        ? 'bg-indigo-600 text-white' 
                        : isActive 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      <plan.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`text-xl font-black ${isExpert ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  </div>
                  {discount && (
                    <div className={`px-3 py-1 rounded-xl text-[9px] font-black animate-pulse ${isExpert ? 'bg-indigo-500 text-white' : 'bg-red-100 text-red-600'}`}>
                      -{discount}%
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${isExpert ? 'text-white' : 'text-slate-900'}`}>€{plan.price}</span>
                  {plan.oldPrice && (
                    <span className={`text-xl font-bold line-through opacity-50 ${isExpert ? 'text-indigo-300' : 'text-slate-400'}`}>
                      €{plan.oldPrice}
                    </span>
                  )}
                  <span className={`font-black text-xs uppercase tracking-widest ml-1 ${isExpert ? 'text-indigo-400' : 'text-slate-400'}`}>{t.bill_month}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-4 text-xs font-bold ${isExpert ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Check className={`w-3 h-3 mt-1 shrink-0 ${isExpert ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={4} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                disabled={isActive}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                  isActive 
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : isExpert
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 shadow-3xl'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl'
                }`}
              >
                {isActive ? t.bill_btn_active : isExpert ? t.bill_btn_sub : t.bill_btn_choose}
                {isExpert && !isActive && <Sparkles className="w-4 h-4 animate-pulse" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Billing;
