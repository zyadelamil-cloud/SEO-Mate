
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  Github, 
  Chrome,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { t } = useLanguage();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const SQL_SETUP = `-- 1. Tables de base
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Fonction automatique pour créer le profil (Évite les erreurs RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Déclencheur (Trigger)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sécurité (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Items: viewable by owner" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Items: insertable by owner" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Items: deletable by owner" ON public.items FOR DELETE USING (auth.uid() = user_id);`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSqlGuide(false);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      if (err.message === 'DATABASE_SETUP_REQUIRED' || err.message.includes('schema cache')) {
        setError('Configuration de la base de données requise.');
        setShowSqlGuide(true);
      } else {
        setError(err.message);
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
    <div className="min-h-screen flex bg-white overflow-hidden font-inter">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 z-10 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8 py-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">SEO-MATE</h1>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Bon retour !' : 'Rejoindre la Forge'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin 
                ? 'Connectez-vous pour continuer à forger votre contenu.' 
                : 'Créez votre compte et commencez à dominer les SERPs.'}
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 animate-in slide-in-from-top-2 ${showSqlGuide ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 shrink-0 ${showSqlGuide ? 'text-indigo-600' : 'text-red-600'}`} />
                <span className={`text-sm font-bold ${showSqlGuide ? 'text-indigo-700' : 'text-red-700'}`}>{error}</span>
              </div>
              
              {showSqlGuide && (
                <div className="mt-2 space-y-4">
                  <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                    Les politiques RLS d'insertion manuelle peuvent échouer. Utilisez ce script pour installer un <strong>Trigger</strong> (déclencheur) qui créera votre profil automatiquement :
                  </p>
                  <div className="relative group">
                    <pre className="text-[10px] bg-slate-900 text-indigo-300 p-4 rounded-xl overflow-x-auto max-h-40 font-mono">
                      {SQL_SETUP}
                    </pre>
                    <button 
                      onClick={copySql}
                      className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      {copiedSql ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? 'Copié' : 'Copier SQL'}
                    </button>
                  </div>
                </div>
              )}
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
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Oublié ?</button>
                )}
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
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
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
            {isLogin ? "Vous n'avez pas de compte ?" : "Déjà un compte ?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-black uppercase tracking-wider hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side: Decorative */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply opacity-20"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -mr-96 -mt-96"></div>
        
        <div className="relative z-10 text-center space-y-8 p-20">
          <div className="inline-flex p-6 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl mb-8">
            <Database className="w-20 h-20 text-indigo-400" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
            Générez du contenu qui <br /> <span className="text-indigo-400">domine le classement.</span>
          </h2>
          <p className="text-white/40 text-lg font-medium max-w-md mx-auto italic">
            Connectez votre base de données Supabase pour sauvegarder vos créations à vie.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
