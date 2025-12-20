
import React, { useState, useRef } from 'react';
import { 
  Mail, 
  Apple, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck,
  Globe,
  Loader2,
  ChevronLeft,
  Lock,
  RefreshCcw,
  ChevronDown,
  Sparkles,
  User as UserIcon,
  Search
} from 'lucide-react';
import { APIConfig } from '../types';

interface LoginProps {
  onLogin: (firstName: string) => void;
}

type AuthView = 'initial' | 'verification';
type AuthMethod = 'email' | 'phone' | 'apple';
type AuthMode = 'login' | 'signup';

const countries = [
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'USA', prefix: '+1', flag: '🇺🇸' },
  { code: 'UK', name: 'Royaume-Uni', prefix: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Allemagne', prefix: '+49', flag: '🇩🇪' },
  { code: 'ES', name: 'Espagne', prefix: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', prefix: '+39', flag: '🇮🇹' },
  { code: 'MA', name: 'Maroc', prefix: '+212', flag: '🇲🇦' },
  { code: 'AE', name: 'Émirats Arabes Unis', prefix: '+971', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgique', prefix: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', prefix: '+41', flag: '🇨🇭' },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('initial');
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [loading, setLoading] = useState(false);
  const [contactValue, setContactValue] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const apiConfig: APIConfig = JSON.parse(localStorage.getItem('seomate_api') || '{"devMode": true}');

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.prefix.includes(countrySearch)
  );

  const handleAppleLogin = () => {
    setLoading(true);
    // Simplification : Connexion Apple directe sans vue iCloud intermédiaire
    setTimeout(() => {
      onLogin(firstName || 'Apple User');
      setLoading(false);
    }, 1200);
  };

  const sendSecurityCode = async (target: string) => {
    if (mode === 'signup' && !firstName) {
      alert("Veuillez entrer votre prénom.");
      return;
    }
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // Logique de simulation d'envoi
    if (apiConfig.devMode) {
      console.warn(`%c[SECURITY] Code envoyé à ${target} : ${code}`, "color: #6366f1; font-weight: bold;");
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setView('verification');
    setLoading(false);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue) return;
    if (mode === 'signup' && !firstName) return;
    const target = method === 'phone' ? `${selectedCountry.prefix}${contactValue}` : contactValue;
    sendSecurityCode(target);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleVerify = () => {
    if (otp.join('') !== generatedCode) {
      alert("Code incorrect.");
      return;
    }
    const finalName = mode === 'signup' ? firstName : (localStorage.getItem('seomate_last_user') || 'Expert');
    onLogin(finalName);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
        <div className="glass rounded-[64px] border border-white/40 p-10 md:p-14 shadow-4xl relative min-h-[640px] flex flex-col justify-center">
          
          {view === 'initial' && (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-slate-900 p-5 rounded-[32px] shadow-2xl mb-8 animate-floating">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                  {mode === 'login' ? 'Heureux de vous revoir' : 'Rejoindre SEO-Mate'}
                </h1>
                <p className="text-slate-400 font-bold text-sm">
                  {mode === 'login' ? 'Connectez-vous à votre console' : 'Créez votre compte expert en quelques secondes'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex p-1.5 bg-slate-100/80 rounded-[28px] mb-4">
                  <button 
                    onClick={() => setMode('login')} 
                    className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
                  >
                    Connexion
                  </button>
                  <button 
                    onClick={() => setMode('signup')} 
                    className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
                  >
                    Inscription
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Ton Prénom</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="Jean" 
                        className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none transition-all" 
                      />
                    </div>
                  </div>
                )}

                <div className="flex p-1.5 bg-slate-50 rounded-[28px]">
                  <button onClick={() => setMethod('email')} className={`flex-1 py-2.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}>Email</button>
                  <button onClick={() => setMethod('phone')} className={`flex-1 py-2.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}>Mobile</button>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  {method === 'phone' ? (
                    <div className="relative flex gap-2">
                      <div className="relative">
                        <button type="button" onClick={() => setShowCountryPicker(!showCountryPicker)} className="h-[72px] px-5 bg-white border-2 border-slate-100 rounded-[28px] flex items-center gap-2 hover:border-indigo-200 transition-all min-w-[120px]">
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span className="text-sm font-bold text-slate-600">{selectedCountry.prefix}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                        
                        {showCountryPicker && (
                          <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-slate-100 rounded-[32px] shadow-4xl z-[150] overflow-hidden animate-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-50">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input 
                                  type="text" 
                                  placeholder="Rechercher..." 
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                              {filteredCountries.map(c => (
                                <button 
                                  key={c.code} 
                                  type="button"
                                  onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">{c.flag}</span>
                                    <span className="text-xs font-bold text-slate-700">{c.name}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">{c.prefix}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <input required type="tel" value={contactValue} onChange={(e) => setContactValue(e.target.value)} placeholder="06 00 00 00 00" className="flex-1 px-8 py-5 h-[72px] bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none" />
                    </div>
                  ) : (
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input required type="email" value={contactValue} onChange={(e) => setContactValue(e.target.value)} placeholder="votre@email.com" className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none transition-all shadow-inner" />
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-7 bg-slate-900 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{mode === 'login' ? 'Se Connecter' : 'Continuer'} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-6 text-slate-300">ou utiliser</span></div></div>
                
                <button onClick={handleAppleLogin} disabled={loading} className="w-full py-5 bg-white border-2 border-slate-100 rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-slate-900 transition-all shadow-sm">
                  {loading && method === 'apple' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Apple className="w-5 h-5" />} Apple ID
                </button>
              </div>
            </>
          )}

          {view === 'verification' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('initial')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Retour
              </button>
              <div className="text-center">
                <p className="text-slate-900 font-black text-xl mb-2">Code de sécurité</p>
                <p className="text-slate-400 text-xs font-bold">Entrez les 6 chiffres pour valider votre identité.</p>
              </div>
              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <input 
                    key={index} 
                    ref={el => { otpRefs.current[index] = el; }} 
                    type="text" 
                    maxLength={1} 
                    value={digit} 
                    onChange={e => handleOtpChange(index, e.target.value)} 
                    className="w-full h-20 text-center text-3xl font-black bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 outline-none transition-all shadow-inner" 
                  />
                ))}
              </div>
              <button onClick={handleVerify} className="w-full py-7 bg-slate-900 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                Finaliser l'accès <ShieldCheck className="w-4 h-4" />
              </button>
              <div className="text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 mx-auto">
                  <RefreshCcw className="w-3 h-3" /> Renvoyer le code
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-300">
             <div className="flex items-center gap-2"><Lock className="w-4 h-4 opacity-50" /><span className="text-[9px] font-black uppercase tracking-widest">SSL Secure</span></div>
             <div className="flex items-center gap-2"><Globe className="w-4 h-4 opacity-50" /><span className="text-[9px] font-black uppercase tracking-widest">Global Auth</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
