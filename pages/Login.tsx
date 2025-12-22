
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
  MessageSquare,
  ExternalLink
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
  const [method, setMethod] = useState<AuthMethod>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);
  
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
    // Détection si l'app est dans une iframe (ce qui bloque Discord/Google auth)
    setIsInIframe(window.self !== window.top);

    const handleClickOutside = (event: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setShowCountryPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError("Erreur Discord : " + err.message);
      setLoading(false);
    }
  };

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
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
      } else {
        const fullPhone = `${selectedCountry.prefix}${phone}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            shouldCreateUser: true,
            data: mode === 'signup' ? { first_name: firstName } : undefined
          }
        });
        
        if (otpError) throw otpError;
        
        setView('verification');
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
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
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
    if (code.length < 6) return setError("Entrez le code de 6 chiffres.");

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
      setError("Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
        
        {/* Alerte Iframe pour Discord */}
        {isInIframe && (
          <div className="mb-6 bg-amber-500 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Ouvrez l'app dans un nouvel onglet pour Discord</p>
            </div>
            <button onClick={() => window.open(window.location.href, '_blank')} className="bg-white/20 p-2 rounded-xl">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="glass rounded-[64px] border border-white/40 p-10 md:p-14 shadow-4xl relative min-h-[740px] flex flex-col justify-center overflow-hidden">
          
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
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">SEO-Mate AI</h1>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase">Connectez vos réseaux ou mobile</p>
              </div>

              <div className="space-y-6">
                {/* METHOD SWITCHER */}
                <div className="flex p-1.5 bg-slate-50 rounded-[24px]">
                  <button onClick={() => setMethod('phone')} className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                    <Smartphone className="w-3 h-3" /> Numéro
                  </button>
                  <button onClick={() => setMethod('email')} className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                    <Mail className="w-3 h-3" /> Email
                  </button>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="relative animate-in slide-in-from-top-2">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                      <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre Prénom" className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                    </div>
                  )}

                  {method === 'phone' ? (
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
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domaine.com" className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full pl-16 pr-16 py-6 bg-white border-2 border-slate-100 rounded-[28px] text-lg font-bold focus:border-indigo-600 outline-none shadow-sm transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full py-7 mt-2 bg-slate-900 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (method === 'phone' ? 'Envoyer le code par SMS' : 'Connexion Cloud')}
                  </button>
                </form>

                <div className="relative py-2">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-300">OU</span></div>
                </div>

                {/* DISCORD BUTTON */}
                <button 
                  onClick={handleDiscordLogin}
                  disabled={loading}
                  className="w-full py-6 bg-[#5865F2] text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-xl flex items-center justify-center gap-4 active:scale-[0.98]"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                  </svg>
                  Continuer avec Discord
                </button>

                <div className="text-center pt-2">
                  <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                    {mode === 'login' ? "Nouveau ici ? Créer un compte" : "Déjà inscrit ? Se connecter"}
                  </button>
                </div>
              </div>
            </>
          )}

          {view === 'verification' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('initial')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Retour
              </button>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[38px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Vérifiez vos SMS</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">
                  Code de sécurité envoyé au <br/>
                  <span className="text-indigo-600 font-black px-4 py-1.5 bg-indigo-50 rounded-2xl mt-3 inline-block border border-indigo-100">
                    {selectedCountry.prefix} {phone}
                  </span>
                </p>
              </div>

              {/* OTP INPUTS */}
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

              <div className="space-y-6">
                <button 
                  onClick={handleVerify} 
                  disabled={loading || otp.some(d => !d)} 
                  className="w-full py-7 bg-indigo-600 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-slate-900 shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer le code'}
                </button>
                
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Code non reçu ? <button onClick={handleInitialSubmit} className="text-indigo-600 hover:underline">Renvoyer par SMS</button>
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
