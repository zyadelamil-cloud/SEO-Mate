
import React from 'react';
import { 
  Check, 
  CreditCard, 
  Plus, 
  Download, 
  Zap,
  Star,
  Coins,
  Sparkles,
  Crown,
  FileText,
  Mail as MailIcon,
  AlignLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePlan } from '../context/PlanContext';
import { PlanType } from '../types';

const plans = (t: any) => [
  {
    id: PlanType.BASIC,
    name: t.billing.plans.basic.name,
    price: '0',
    description: t.billing.plans.basic.desc,
    features: t.billing.plans.basic.feat,
    limits: { article: 1200, email: 500 },
    buttonText: t.billing.currentPlan,
    color: 'slate'
  },
  {
    id: PlanType.PRO,
    name: t.billing.plans.pro.name,
    price: '22',
    description: t.billing.plans.pro.desc,
    features: t.billing.plans.pro.feat,
    limits: { article: 2400, email: 1200 },
    buttonText: 'Upgrade to PRO',
    special: true,
    color: 'indigo'
  },
  {
    id: PlanType.PREMIUM,
    name: t.billing.plans.premium.name,
    price: '39',
    description: t.billing.plans.premium.desc,
    features: t.billing.plans.premium.feat,
    limits: { article: 6000, email: 2400 },
    buttonText: 'Get Unlimited',
    color: 'amber'
  }
];

const cards = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', default: true },
];

const invoices = [
  { id: 'INV-001', date: 'May 01, 2024', amount: '€0.00', status: 'Paid' },
  { id: 'INV-002', date: 'Apr 01, 2024', amount: '€22.00', status: 'Paid' },
];

const Billing: React.FC = () => {
  const { t } = useLanguage();
  const { plan: currentPlan, setPlan } = usePlan();
  const currentPlans = plans(t);

  const getPlanStyles = (planId: PlanType, isSpecial: boolean) => {
    if (currentPlan === planId) return "border-indigo-600 ring-[6px] ring-indigo-50 shadow-2xl scale-[1.02] z-10";
    if (planId === PlanType.PREMIUM) return "border-amber-100 bg-gradient-to-b from-white to-amber-50/20";
    if (isSpecial) return "border-indigo-100 shadow-xl shadow-indigo-100/50 hover:scale-[1.01]";
    return "border-slate-100 hover:border-slate-200";
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-block p-3 bg-indigo-50 rounded-2xl mb-6">
          <Star className="w-8 h-8 text-indigo-600 fill-current" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">{t.billing.title}</h1>
        <p className="text-slate-500 font-medium text-xl mt-3">{t.billing.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {currentPlans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative bg-white rounded-[40px] border-2 p-8 transition-all duration-500 flex flex-col ${getPlanStyles(plan.id, !!plan.special)}`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                {t.billing.currentPlan}
              </div>
            )}
            {plan.special && currentPlan !== plan.id && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                <Sparkles className="w-3 h-3" /> {t.billing.mostPopular}
              </div>
            )}
            
            <div className="mb-6 text-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">{plan.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-6">
                <span className="text-xs font-black text-slate-400 self-start mt-2">€</span>
                <span className="text-5xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                <span className="text-slate-400 font-bold text-sm ml-1">{t.billing.mo}</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium leading-relaxed px-4">{plan.description}</p>
            </div>

            {/* Word Limits Block - NEW */}
            <div className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <AlignLeft className="w-3 h-3 text-indigo-500" /> {t.billing.forgeLimits}
                </span>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${plan.id === PlanType.PREMIUM ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  Volume {plan.limits.article}m
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> {t.billing.limitArticle}
                </div>
                <span className="text-xs font-black text-slate-900">{plan.limits.article}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                  <MailIcon className="w-3.5 h-3.5 text-slate-400" /> {t.billing.limitEmail}
                </div>
                <span className="text-xs font-black text-slate-900">{plan.limits.email}</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1 px-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-4 text-[13px] font-semibold text-slate-600">
                  <div className={`mt-0.5 p-1 rounded-full shrink-0 ${
                    plan.id === PlanType.PREMIUM ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <Check className="w-2.5 h-2.5 stroke-[4px]" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => currentPlan !== plan.id && setPlan(plan.id)}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                currentPlan === plan.id 
                ? 'bg-slate-100 text-slate-400 cursor-default shadow-none' 
                : plan.id === PlanType.PREMIUM
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {currentPlan === plan.id ? 'ACTIVE SESSION' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t.billing.paymentMethods}</h3>
              </div>
              <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" /> {t.billing.addCard}
              </button>
            </div>
            <div className="p-8 space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-black italic text-indigo-900 tracking-tighter">{card.type}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-slate-900">•••• •••• •••• {card.last4}</p>
                        {card.default && <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-black tracking-widest">{t.billing.default}</span>}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">EXPIRES {card.expiry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/30 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Coins className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">{t.billing.extraTokens}</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium max-w-xs">{t.billing.tokenDesc}</p>
                </div>
                <Sparkles className="w-10 h-10 text-indigo-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/5 hover:bg-white/10 p-5 rounded-[24px] border border-white/5 transition-all text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">10 Articles</p>
                  <p className="text-2xl font-black">€10.00</p>
                </button>
                <button className="bg-white/5 hover:bg-white/10 p-5 rounded-[24px] border border-white/5 transition-all text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">50 Articles</p>
                  <p className="text-2xl font-black">€45.00</p>
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t.billing.history}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{t.billing.historyDesc}</p>
          </div>
          <div className="flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Invoice</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-sm font-black text-slate-900 uppercase tracking-tighter">{inv.id}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{inv.date}</td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">{inv.amount}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group-hover:scale-110">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Billing;
