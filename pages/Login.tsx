
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
  ExternalLink,
  ChevronRight
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
    // Detect if the app is inside an iframe (which blocks many OAuth flows like Discord)
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
      // Note: If redirect fails with localhost, check Supabase Dashboard -> Auth -> URL Configuration
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
          const { error: signUpError } = await supabase.auth.signUp({
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
      if (err.message.includes("provider") || err.message.includes("not enabled")) {
        setError("L'authentification par SMS n'est pas activée. Vérifiez votre console Supabase.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
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
    if (code.length < 6) return setError("Veuillez entrer le code de 6 chiffres.");

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
      setError("Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
        
        {/* Connection Hint for Iframe users */}
        {isInIframe && (
          <div className="mb-6 bg-indigo-600 text-white p-5 rounded-[32px] shadow-2xl flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ouvrez l'application en grand pour Discord</p>
            </div>
            <button 
              onClick={() => window.open(window.location.href, '_blank')} 
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all shadow-lg"
            >
              Lancer <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="glass rounded-[64px] border border-white/40 p-10 md:p-14 shadow-4xl relative min-h-[760px] flex flex-col justify-center overflow-hidden">
          
          {error && (
            <div className="absolute top-0 left-0 right-0 animate-in slide-in-from-top duration-300 z-[110]">
              <div className="bg-red-500 text-white px-8 py-5 flex items-center justify-between shadow-2xl">
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
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-slate-900 p-5 rounded-[32px] shadow-2xl mb-8 animate-floating">
                  <TrendingUp className="text-white w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                  {mode === 'login' ? 'Content Forge' : 'Join the Elite'}
                </h1>
                <p className="text-slate-500 font-medium">
                  {mode === 'login' ? 'Propulsez votre SEO avec l\'IA.' : 'Créez votre compte expert maintenant.'}
                </p>
              </div>

              <div className="flex p-1.5 bg-slate-100 rounded-[28px] mb-10">
                <button 
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${method === 'phone' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                >
                  <Smartphone className="w-4 h-4" /> Phone
                </button>
                <button 
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${method === 'email' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="relative group">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="Prénom" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                )}

                {method === 'email' ? (
                  <>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="email" 
                        placeholder="Email professionnel" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type={showPassword ? "text" : "password"} 
                        placeholder="Mot de passe" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-16 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <div className="relative group">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                          required
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirmer le mot de passe" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-16 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex gap-4">
                    <div className="relative shrink-0" ref={countryPickerRef}>
                      <button 
                        type="button"
                        onClick={() => setShowCountryPicker(!showCountryPicker)}
                        className="h-full px-6 bg-slate-50 border-2 border-transparent rounded-[24px] flex items-center gap-3 font-black text-sm hover:border-indigo-100 transition-all shadow-inner"
                      >
                        <span>{selectedCountry.flag}</span>
                        <span className="text-slate-400">{selectedCountry.prefix}</span>
                      </button>
                      {showCountryPicker && (
                        <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-[32px] shadow-4xl border border-slate-100 p-3 z-[120] max-h-80 overflow-y-auto scrollbar-hide animate-in slide-in-from-top-4 duration-300">
                          {countries.map((c) => (
                            <button key={c.code} type="button" onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all">
                              <div className="flex items-center gap-3">
                                <span>{c.flag}</span>
                                <span className="text-xs font-black text-slate-900">{c.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-600">{c.prefix}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1 group">
                      <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="tel" 
                        placeholder="6 12 34 56 78" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                )}

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Accéder à la Forge' : 'Créer mon Compte')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-10 flex items-center gap-6">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Ou continuer avec</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="mt-10">
                <button 
                  onClick={handleDiscordLogin}
                  disabled={loading}
                  className="w-full py-5 bg-[#5865F2] text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#4752C4] transition-all shadow-xl"
                >
                  <MessageSquare className="w-5 h-5" /> Discord Pro Access
                </button>
              </div>

              <div className="mt-10 text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors"
                >
                  {mode === 'login' ? 'Pas encore de compte ? Rejoindre l\'élite' : 'Déjà membre ? Se connecter'}
                </button>
              </div>
            </>
          )}

          {view === 'verification' && (
            <div className="animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('initial')} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors mb-10 group">
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Retour
              </button>
              
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Vérification</h2>
                <p className="text-slate-500 font-medium">Code envoyé au {selectedCountry.prefix} {phone}</p>
              </div>

              <div className="flex justify-between gap-3 mb-12">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-16 md:w-16 md:h-20 bg-slate-50 border-2 border-transparent rounded-[20px] text-center text-2xl font-black focus:border-indigo-600 outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              <button 
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-3xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier le Code'}
              </button>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => handleInitialSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600"
                >
                  Renvoyer le code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
