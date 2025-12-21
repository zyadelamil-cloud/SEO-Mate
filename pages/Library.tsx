
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Copy,
  Plus,
  X,
  CheckCircle2,
  Activity,
  Clock
} from 'lucide-react';
import { GeneratedArticle, UserSubscription } from '../types';

interface LibraryProps {
  articles: GeneratedArticle[];
  onDelete: (id: string) => void;
  subscription: UserSubscription;
  // Fix: Added 't' translation prop
  t: any;
}

// Fix: Destructured 't' from props
const Library: React.FC<LibraryProps> = ({ articles, onDelete, subscription, t }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [langFilter, setLangFilter] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? article.status === (statusFilter === 'Published' ? 'published' : 'draft') : true;
      const matchesLang = langFilter ? article.lang.toUpperCase() === langFilter.toUpperCase() : true;
      return matchesSearch && matchesStatus && matchesLang;
    });
  }, [articles, searchTerm, statusFilter, langFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      onDelete(id);
      showToast("Article supprimé de la bibliothèque.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Contenu copié dans le presse-papier.");
  };

  return (
    <div className="space-y-10 pb-20 relative animate-in fade-in duration-700">
      {notification && (
        <div className="fixed top-8 right-8 z-[100] bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-4xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border border-indigo-500/30">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <span className="font-black text-xs uppercase tracking-widest">{notification}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Gestion de Contenu</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{t.lib_title}</h1>
          <p className="text-slate-500 font-medium mt-2">{t.lib_subtitle}</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${showFilters || statusFilter || langFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-600'}`}>
            <Filter className="w-4 h-4" /> {t.lib_filters}
          </button>
          <button onClick={() => navigate('/generate')} className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> {t.lib_new}
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-3xl animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">État de Publication</label>
              <div className="flex gap-2">
                {['Published', 'Draft'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {s === 'Published' ? 'Publié' : 'Brouillon'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end justify-end">
              <button onClick={() => { setStatusFilter(null); setLangFilter(null); setShowFilters(false); }} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-red-500 transition-colors flex items-center gap-2">
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-[48px] shadow-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input type="text" placeholder={t.lib_search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-sm font-bold focus:outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-[0.4em]">
              <tr>
                <th className="px-10 py-6">{t.lib_th_name}</th>
                <th className="px-10 py-6">{t.lib_th_status}</th>
                <th className="px-10 py-6">{t.lib_th_score}</th>
                <th className="px-10 py-6 text-right">{t.lib_th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-50 rounded-[20px] group-hover:bg-slate-900 transition-all shadow-sm">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                        <div>
                          <span className="font-black text-base text-slate-800 group-hover:text-indigo-600 block mb-1">{article.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{article.createdAt} • {article.lang}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {article.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0 shadow-inner">
                          <div className={`h-full rounded-full bg-indigo-600`} style={{ width: `${article.seoScore}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-slate-700">{article.seoScore}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopy(article.content)} className="p-3 bg-white border border-slate-100 hover:bg-indigo-50 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-3 bg-white border border-slate-100 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-600 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-bold">Aucun document trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Library;
