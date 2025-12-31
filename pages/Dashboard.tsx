
import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Globe,
  ArrowRight,
  Clock,
  ExternalLink,
  Mail
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Mon', articles: 4 },
  { name: 'Tue', articles: 7 },
  { name: 'Wed', articles: 5 },
  { name: 'Thu', articles: 12 },
  { name: 'Fri', articles: 8 },
  { name: 'Sat', articles: 3 },
  { name: 'Sun', articles: 2 },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
        {trend >= 0 ? '+' : ''}{trend}%
      </div>
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { items, stats } = useContent();

  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.dashboard.welcome}</h1>
          <p className="text-slate-500 font-medium mt-1">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
              <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">+12</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.dashboard.stats.totalArticles} value={stats.totalArticles} icon={FileText} trend={12} color="bg-blue-50 text-blue-600" />
        <StatCard title={t.dashboard.stats.totalWords} value={`${(stats.totalWords / 1000).toFixed(1)}k`} icon={TrendingUp} trend={8} color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Total Emails" value={stats.totalEmails} icon={Mail} trend={0} color="bg-purple-50 text-purple-600" />
        <StatCard title={t.dashboard.stats.avgScore} value="84/100" icon={Users} trend={5} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black tracking-tight text-slate-900">{t.dashboard.activity}</h3>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="articles" stroke="#4f46e5" fillOpacity={1} fill="url(#colorArt)" strokeWidth={3} dot={{fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff'}} activeDot={{r: 6, strokeWidth: 0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000"></div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-lg font-black tracking-tight text-white mb-8">{t.dashboard.recentJobs}</h3>
            <div className="space-y-4 flex-1">
              {recentItems.length > 0 ? recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group/item border border-white/5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg group-hover/item:scale-110 transition-transform ${item.type === 'article' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.type === 'article' ? 'A' : 'E'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white truncate">
                      {item.type === 'article' ? item.title : `Email: ${item.target}`}
                    </p>
                    <p className="text-[10px] text-white/40 flex items-center gap-1 font-bold uppercase tracking-wider mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()} • {item.language}
                    </p>
                  </div>
                  <div className="bg-white/10 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-xs italic py-10 text-center">No recent activity</p>
              )}
            </div>
            <Link to="/library" className="w-full mt-8 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black text-center uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
              {t.dashboard.viewAll}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
