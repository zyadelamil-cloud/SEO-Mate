
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  CheckCircle2, 
  ShieldCheck,
  Smartphone,
  Cpu,
  Save,
  Loader2,
  ArrowRight,
  X,
  MapPin,
  Clock,
  Globe,
  Monitor,
  Tablet,
  Smartphone as PhoneIcon,
  ShieldAlert
} from 'lucide-react';
import { APIConfig, AIModelType } from '../types';

// Données simulées pour le journal de connexion
const MOCK_LOGS = [
  { id: 1, ip: '192.168.1.***', location: 'Paris, FR', date: 'Aujourd\'hui, 14:20', status: 'success' },
  { id: 2, ip: '82.124.45.***', location: 'Lyon, FR', date: 'Hier, 09:15', status: 'success' },
  { id: 3, ip: '176.31.22.***', location: 'Marseille, FR', date: '12 Mars, 22:10', status: 'warning' },
];

// Données simulées pour les appareils
const MOCK_DEVICES = [
  { id: 'dev-1', name: 'MacBook Pro 14"', browser: 'Chrome / macOS', lastActive: 'Actif maintenant', current: true, type: 'desktop' },
  { id: 'dev-2', name: 'iPhone 15 Pro', browser: 'Safari / iOS', lastActive: 'Il y a 2h', current: false, type: 'mobile' },
  { id: 'dev-3', name: 'iPad Air', browser: 'Safari / iPadOS', lastActive: 'Il y a 3 jours', current: false, type: 'tablet' },
];

const Settings: React.FC = () => {
  const [api, setApi] = useState<APIConfig>(() => {
    const saved = localStorage.getItem('seomate_api');
    return saved ? JSON.parse(saved) : { defaultModel: AIModelType.PRO, autoKeywords: true, devMode: true };
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeModal, setActiveModal] = useState<'none' | 'logs' | 'devices'>('none');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('seomate_api', JSON.stringify(api));
  }, [api]);

  const saveSettings = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      setRevokingId(null);
      // Logique de suppression simulée ici si nécessaire
    }, 1000);
  };

  const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[48px] shadow-4xl overflow-hidden border border-slate-100 animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-10 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        <div className="p-8 bg-slate-50 text-center">
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
            Fermer la vue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Configuration Système</h1>
          <p className="text-slate-500 font-medium mt-2">Gérez vos préférences d'intelligence artificielle et vos paramètres de sécurité.</p>
        </div>
        <button 
          onClick={saveSettings}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 self-start md:self-auto"
        >
          {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saveStatus === 'saved' ? 'Enregistré !' : 'Sauvegarder'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* AI Settings Section */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-4 bg-slate-900 text-white rounded-3xl">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Configuration du Cerveau IA</h3>
                <p className="text-sm text-slate-400 font-bold">Définissez le modèle par défaut et le comportement sémantique.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-6 border-b border-slate-50 gap-4">
                <div className="max-w-md">
                  <p className="font-black text-slate-900 text-base">Moteur de Rédaction Principal</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Le pack Pro utilise 'Gemini 3 Pro' pour une précision sémantique maximale.</p>
                </div>
                <select 
                  value={api.defaultModel}
                  onChange={(e) => setApi({...api, defaultModel: e.target.value as AIModelType})}
                  className="bg-slate-50 border-2 border-transparent px-4 md:px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest outline-none focus:border-indigo-600 transition-all cursor-pointer shrink-0"
                >
                  <option value={AIModelType.PRO}>Gemini 3 Pro</option>
                  <option value={AIModelType.FAST}>Gemini 3 Flash</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-slate-50 gap-4">
                <div className="max-w-md">
                  <p className="font-black text-slate-900 text-base">Extraction Sémantique Automatique</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">L'IA analyse les tendances pour optimiser vos mots-clés automatiquement.</p>
                </div>
                <div 
                  onClick={() => setApi({...api, autoKeywords: !api.autoKeywords})}
                  className={`w-14 h-7 shrink-0 rounded-full relative cursor-pointer transition-all duration-300 ${api.autoKeywords ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${api.autoKeywords ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-6 gap-4">
                <div className="max-w-md">
                  <p className="font-black text-slate-900 text-base flex items-center gap-2">Mode Développeur (Sécurité) <ShieldCheck className="w-4 h-4 text-green-500" /></p>
                  <p className="text-xs text-slate-400 font-bold mt-1">Affiche les logs détaillés de génération dans la console.</p>
                </div>
                <div 
                  onClick={() => setApi({...api, devMode: !api.devMode})}
                  className={`w-14 h-7 shrink-0 rounded-full relative cursor-pointer transition-all duration-300 ${api.devMode ? 'bg-slate-900' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${api.devMode ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-indigo-600 rounded-[48px] p-8 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">Status des Tokens</h3>
                <div className="flex items-baseline gap-2 mb-6">
                   <p className="text-6xl font-black tracking-tighter">12.4K</p>
                   <span className="text-sm font-black uppercase opacity-60 tracking-widest">mots</span>
                </div>
                <div className="space-y-3 mb-10">
                   <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[65%] shadow-[0_0_15px_white]"></div>
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-center opacity-60">Production Mensuelle : 65%</p>
                </div>
                <button className="w-full py-5 bg-white text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-2xl">
                   Recharger le Crédit
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                 <Smartphone className="w-4 h-4" /> Sécurité Mobile
              </h3>
              <div className="space-y-4">
                 <button 
                  onClick={() => setActiveModal('logs')}
                  className="w-full text-left p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-indigo-50 transition-all"
                 >
                    <div>
                      <p className="text-sm font-black text-slate-700">Journal de Connexion</p>
                      <p className="text-[9px] font-bold text-slate-400">Voir les IP actives</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                 </button>
                 <button 
                  onClick={() => setActiveModal('devices')}
                  className="w-full text-left p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-indigo-50 transition-all"
                 >
                    <div>
                      <p className="text-sm font-black text-slate-700">Appareils Autorisés</p>
                      <p className="text-[9px] font-bold text-slate-400">Gérer l'accès multisite</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Modals de Sécurité */}
      {activeModal === 'logs' && (
        <Modal title="Journal de Connexion" onClose={() => setActiveModal('none')}>
          <div className="space-y-4">
            {MOCK_LOGS.map(log => (
              <div key={log.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {log.status === 'success' ? <Globe className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-black text-slate-900">{log.ip}</p>
                    <span className="text-[9px] font-black uppercase text-slate-400">{log.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 opacity-60">
                    <MapPin className="w-3 h-3" />
                    <p className="text-[10px] font-bold">{log.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === 'devices' && (
        <Modal title="Gestion des Appareils" onClose={() => setActiveModal('none')}>
          <div className="space-y-4">
            {MOCK_DEVICES.map(device => (
              <div key={device.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400">
                  {device.type === 'desktop' ? <Monitor className="w-6 h-6" /> : device.type === 'tablet' ? <Tablet className="w-6 h-6" /> : <PhoneIcon className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{device.name}</p>
                    {device.current && <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[8px] font-black uppercase">Actuel</span>}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{device.browser}</p>
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-2">{device.lastActive}</p>
                </div>
                {!device.current && (
                  <button 
                    onClick={() => handleRevoke(device.id)}
                    disabled={revokingId === device.id}
                    className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {revokingId === device.id ? 'Révoqué...' : 'Révoquer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;
