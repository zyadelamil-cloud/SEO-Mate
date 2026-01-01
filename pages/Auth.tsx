
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Copy,
  CheckCircle2,
  Info,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const SQL_SETUP = `-- 1. Création des tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Activation de la sécurité
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 3. Politiques (Policies)
CREATE POLICY "Profiles: view own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Items: view own" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Items: insert own" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Items: delete own" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- 4. Trigger automatique pour le profil (CRITIQUE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setShowSqlGuide(false);
    setShowAuthHelp(false);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await signup(formData.name, formData.email, formData.password);
        setSuccessMsg('Compte créé ! Vérifiez vos emails pour confirmer votre compte (ou désactivez la confirmation dans Supabase).');
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = err.message || '';
      console.error('Auth error:', err);
      
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Identifiants invalides ou email non confirmé.');
        setShowAuthHelp(true);
      } else if (msg.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre adresse email.');
        setShowAuthHelp(true);
      } else if (msg.includes('42P01') || msg.includes('profiles') || msg.includes('schema cache')) {
        setError('La base de données n\'est pas configurée.');
        setShowSqlGuide(true);
      } else {
        setError(msg || 'Une erreur est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="min-h-screen flex bg-white font-inter overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2.5 rounded-xl">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase">SEO-MATE</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Bon retour !' : 'Rejoindre la Forge'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Connectez-vous pour continuer.' : 'Créez votre compte gratuitement.'}
            </p>
          </div>

          {error && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-100 space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-sm font-bold text-red-700">{error}</span>
              </div>
              
              {showAuthHelp && (
                <div className="bg-white/50 p-4 rounded-xl border border-red-100 space-y-3">
                  <p className="text-[11px] font-bold text-red-800 leading-relaxed uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Solution rapide :
                  </p>
                  <ol className="text-[10px] text-red-700 font-medium space-y-1 list-decimal ml-4">
                    <li>Allez dans <b>Authentication > Providers</b> dans Supabase.</li>
                    <li>Désactivez <b>"Confirm Email"</b>.</li>
                    <li>Réessayez de vous connecter.</li>
                  </ol>
                </div>
              )}

              {showSqlGuide && (
                <div className="mt-2 space-y-4">
                  <p className="text-[10px] text-red-600 font-black uppercase leading-relaxed">
                    Action Requise : Exécutez le script SQL
                  </p>
                  <div className="relative">
                    <pre className="text-[10px] bg-slate-900 text-indigo-300 p-4 rounded-xl overflow-x-auto max-h-40 font-mono custom-scrollbar">
                      {SQL_SETUP}
                    </pre>
                    <button 
                      onClick={copySql}
                      className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2"
                    >
                      {copiedSql ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-emerald-700">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="nom@exemple.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mot de Passe</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Se connecter' : 'Créer un compte'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-black uppercase tracking-wider hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 opacity-10"></div>
        <div className="relative z-10 text-center p-20">
          <Database className="w-20 h-20 text-indigo-400 mx-auto mb-8" />
          <h2 className="text-5xl font-black text-white leading-tight">Générez du contenu qui <br /> <span className="text-indigo-400">domine le SEO.</span></h2>
        </div>
      </div>
    </div>
  );
};

export default Auth;
