
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  Lock,
  TrendingUp, 
  Loader2,
  ChevronLeft,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (firstName: string) => void;
}

type AuthView = 'initial' | 'verification';
type AuthMethod = 'email' | 'phone';
type AuthMode = 'login' | 'signup';

const countries = [
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', prefix: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', prefix: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'MA', name: 'Maroc', prefix: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', prefix: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', prefix: '+216', flag: '🇹🇳' },
  { code: 'US', name: 'USA', prefix: '+1', flag: '🇺🇸' },
];

const Login: React.FC<LoginProps> = () => {
  const [view, setView] = useState<AuthView>('initial');
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countryPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setShowCountryPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === 'email' && mode === 'signup') {
      if (!firstName) return setError("Le prénom est requis.");
      if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
      if (password.length < 6) return setError("Le mot de passe doit faire au moins 6 caractères.");
    }
    
    setLoading(true);

    try {
      if (method === 'email') {
        if (mode === 'signup') {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: firstName } }
          });
          if (signUpError) throw signUpError;
          if (data.user) {
            await supabase.from('profiles').update({ first_name: firstName }).eq('id', data.user.id);
          }
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
      } else {
        const fullPhone = `${selectedCountry.prefix}${phone}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            shouldCreateUser: mode === 'signup',
            data: mode === 'signup' ? { first_name: firstName } : undefined
          }
        });
        
        if (otpError) {
          if (otpError.message.toLowerCase().includes("provider") || otpError.message.includes("not supported")) {
            throw new Error("L'envoi de SMS n'est pas encore actif. Vérifiez votre console Supabase.");
          }
          throw otpError;
        }
        
        setView('verification');
        // Focus le premier champ OTP après un court délai pour l'animation
        setTimeout(() => otpRefs.current[0]?.focus(), 500);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    // Prendre seulement le dernier caractère
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus prochain champ
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError("Veuillez entrer le code complet de 6 chiffres.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        phone: `${selectedCountry.prefix}${phone}`,
        token: code,
        type: 'sms'
      });
      
      if (verifyError) throw verifyError;

      if (mode === 'signup' && firstName && data?.user) {
        await supabase.from('profiles').update({ first_name: firstName }).eq('id', data.user.id);
      }
    } catch (err: any) {
      setError(err.message || "Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
        <div className="glass rounded-[64px] border border-white/40 p-10 md:p-14 shadow-4xl relative min-h-[680px] flex flex-col justify-center overflow-hidden">
          
          {error && (
            <div className="absolute top-0 left-0 right-0 animate-in slide-in-from-top duration-300 z-[110]">
              <div className="bg-red-500 text-white px-8 py-4 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {view === 'initial' && (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-slate-900 p-5 rounded-[32px] shadow-2xl mb-8 animate-floating">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                  {mode === 'login' ? 'Heureux de vous revoir' : 'Rejoindre SEO-Mate'}
                </h1>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase">Auth Cloud Supabase</p>
              </div>

              <div className="space-y-6">
                <div className="flex p-1.5 bg-slate-100/80 rounded-[28px] mb-2">
                  <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Connexion</button>
                  <button onClick={() => { setMode('signup'); setError(null); }} className={`flex-1 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Inscription</button>
                </div>

                <div className="flex p-1.5 bg-slate-50 rounded-[24px]">
                  <button onClick={() => setMethod('email')} className={`flex-1 py-2 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}>Email</button>
                  <button onClick={() => setMethod('phone')} className={`flex-1 py-2 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}>Mobile</button>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="relative animate-in slide-in-from-top-2">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                      <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre Prénom" className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                    </div>
                  )}

                  {method === 'email' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domaine.com" className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full pl-16 pr-16 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {mode === 'signup' && (
                        <div className="relative animate-in slide-in-from-top-2">
                          <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                          <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer mot de passe" className={`w-full pl-16 pr-16 py-6 bg-white border-2 rounded-[28px] text-lg font-bold outline-none shadow-sm transition-all ${confirmPassword && confirmPassword !== password ? 'border-red-200 bg-red-50/10' : 'border-slate-100 focus:border-indigo-600'}`} />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative flex gap-2">
                      <div className="relative" ref={countryPickerRef}>
                        <button type="button" onClick={() => setShowCountryPicker(!showCountryPicker)} className="h-[72px] px-5 bg-white border-2 border-slate-100 rounded-[28px] flex items-center gap-2 min-w-[110px] shadow-sm hover:border-indigo-200 transition-all">
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span className="text-sm font-black text-slate-900">{selectedCountry.prefix}</span>
                        </button>
                        {showCountryPicker && (
                          <div className="absolute top-full left-0 mt-3 w-64 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-[32px] shadow-4xl z-[200] p-2">
                            {countries.map(c => (
                              <button key={c.code} type="button" onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }} className="w-full flex items-center p-3 hover:bg-slate-50 rounded-2xl text-left gap-3">
                                <span className="text-lg">{c.flag}</span>
                                <span className="text-[10px] font-black uppercase text-slate-900">{c.name} ({c.prefix})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06..." className="flex-1 px-8 py-5 h-[72px] bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full py-7 mt-4 bg-slate-900 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Se Connecter' : 'Créer mon Compte')}
                  </button>
                </form>
              </div>
            </>
          )}

          {view === 'verification' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('initial')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Revenir au numéro
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Vérification SMS</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Code envoyé au <span className="text-indigo-600">{selectedCountry.prefix} {phone}</span>
                </p>
              </div>

              {/* CHAMPS OTP AMELIORES */}
              <div className="flex justify-between gap-3 px-2">
                {otp.map((digit, index) => (
                  <input 
                    key={index} 
                    ref={el => { otpRefs.current[index] = el; }} 
                    type="text" 
                    inputMode="numeric"
                    maxLength={1} 
                    value={digit} 
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onChange={e => handleOtpChange(index, e.target.value)} 
                    className="w-full h-20 text-center text-3xl font-black bg-white border-2 border-slate-100 rounded-[24px] focus:border-indigo-600 focus:bg-indigo-50/10 outline-none shadow-sm transition-all" 
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleVerify} 
                  disabled={loading || otp.some(d => !d)} 
                  className="w-full py-7 bg-indigo-600 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-slate-900 shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer Access'}
                </button>
                
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Pas reçu de code ? <button onClick={handleInitialSubmit} className="text-indigo-600 hover:underline">Renvoyer</button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
