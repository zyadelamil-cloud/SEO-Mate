
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Mail,
  Zap,
  X,
  Calendar,
  Globe,
  Award,
  ArrowLeft,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { LibraryItem, GeneratedArticle, GeneratedEmail } from '../types';

const Library: React.FC = () => {
  const { t } = useLanguage();
  const { items, removeItem } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const title = item.type === 'article' ? item.title : `Email for ${item.target}`;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const closeViewer = () => setSelectedItem(null);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.library.title}</h1>
          <p className="text-slate-500 font-medium">{t.library.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> {t.library.filter}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder={t.library.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">{t.library.table.title}</th>
              <th className="px-8 py-5">{t.library.table.status}</th>
              <th className="px-8 py-5">{t.library.table.score} / Tone</th>
              <th className="px-8 py-5">{t.library.table.lang}</th>
              <th className="px-8 py-5">{t.library.table.date}</th>
              <th className="px-8 py-5 text-right">{t.library.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => setSelectedItem(item)}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${item.type === 'article' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                      {item.type === 'article' ? <FileText className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-slate-800 truncate max-w-xs block group-hover:text-indigo-600 transition-colors">
                      {item.type === 'article' ? item.title : `Email: ${item.target}`}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    item.type === 'article' ? (item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500') : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.type === 'article' ? item.status : 'Email'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {item.type === 'article' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.seoScore > 85 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${item.seoScore}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-600">{item.seoScore}%</span>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{item.tone}</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-3 h-3" /> {item.language}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-90"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const content = item.type === 'article' ? (item as GeneratedArticle).content : (item as GeneratedEmail).body;
                        copyToClipboard(content, item.id);
                      }}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-90"
                    >
                      {copiedId === item.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-32 text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                     <Zap className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Aucun contenu trouvé</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Affichage de {filteredItems.length} résultats</p>
        </div>
      </div>

      {/* --- CONTENT VIEWER MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={closeViewer}></div>
          
          <div className="bg-white w-full max-w-5xl h-full lg:max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
              <div className="flex items-center gap-6">
                <button 
                  onClick={closeViewer}
                  className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${selectedItem.type === 'article' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedItem.type === 'article' ? 'Article SEO' : 'Email Professionnel'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                   <h2 className="text-xl font-black text-slate-900 max-w-xl truncate">
                    {selectedItem.type === 'article' ? (selectedItem as GeneratedArticle).title : `Forge d'Email pour ${selectedItem.type === 'email' ? (selectedItem as GeneratedEmail).target : ''}`}
                   </h2>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                     const content = selectedItem.type === 'article' ? (selectedItem as GeneratedArticle).content : (selectedItem as GeneratedEmail).body;
                     copyToClipboard(content, 'view-copy');
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  {copiedId === 'view-copy' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedId === 'view-copy' ? 'Copié !' : 'Copier tout'}
                </button>
                <button 
                   onClick={closeViewer}
                   className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-12 lg:p-20 custom-scrollbar">
              {selectedItem.type === 'article' ? (
                <div className="max-w-3xl mx-auto space-y-12">
                   {/* SEO Meta Box */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                         <Award className="w-8 h-8 text-indigo-600 mb-2" />
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Score SEO</span>
                         <span className="text-4xl font-black text-indigo-600 tracking-tighter">{(selectedItem as GeneratedArticle).seoScore}</span>
                      </div>
                      <div className="md:col-span-2 bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Meta Description Expert</span>
                         <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{(selectedItem as GeneratedArticle).metaDescription}"</p>
                      </div>
                   </div>

                   <article className="prose prose-indigo max-w-none">
                      <h1 className="text-5xl font-black text-slate-900 mb-12 leading-[1.1] tracking-tight">{(selectedItem as GeneratedArticle).title}</h1>
                      <div className="whitespace-pre-wrap text-slate-600 leading-[1.8] text-xl font-medium tracking-tight font-serif italic">
                        {(selectedItem as GeneratedArticle).content}
                      </div>
                   </article>
                   
                   <div className="pt-12 border-t border-slate-50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Mots-clés optimisés</span>
                      <div className="flex flex-wrap gap-2">
                         {(selectedItem as GeneratedArticle).keywords.map((kw, i) => (
                           <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl text-xs font-bold uppercase tracking-wide">#{kw}</span>
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-12">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-500" /> OBJETS RECOMMANDÉS
                      </h3>
                      <div className="space-y-3">
                         {(selectedItem as GeneratedEmail).subjects.map((sub, i) => (
                            <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group">
                               <span className="text-sm font-bold text-slate-700">{sub}</span>
                               <button 
                                 onClick={() => copyToClipboard(sub, `sub-modal-${i}`)}
                                 className="text-indigo-600 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 {copiedId === `sub-modal-${i}` ? 'Copié' : 'Copier'}
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6 pt-12 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CORPS DU MESSAGE</h3>
                         <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">TON : {(selectedItem as GeneratedEmail).tone}</span>
                      </div>
                      <div className="bg-slate-50/50 p-10 lg:p-16 rounded-[40px] border border-slate-100 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                           <Mail className="w-12 h-12 text-slate-100 group-hover:text-amber-100 transition-colors" />
                        </div>
                        <div className="relative z-10 whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-xl italic font-serif">
                          {(selectedItem as GeneratedEmail).body}
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-center sticky bottom-0">
               <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {selectedItem.language}</span>
                  <span className="flex items-center gap-2"><Award className="w-4 h-4" /> SEO Ready</span>
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> AI Powered</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
