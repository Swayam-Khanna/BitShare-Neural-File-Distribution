import { memo } from 'react';

export const StatCard = memo(({ title, value, icon, desc }: any) => (
  <div 
    className="glass p-8 rounded-[2.5rem] cursor-default relative overflow-hidden group border-white/5 transition-all duration-500 hover:-translate-y-2 gpu-accel"
  >
    <div className={`absolute -right-4 -top-4 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
      {icon}
    </div>
    <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/5 text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary-500/20`}>
          {icon}
        </div>
    </div>
    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-3xl md:text-4xl font-black tracking-tighter mb-3">{value}</p>
    <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{desc}</span>
    </div>
  </div>
));

export const AnalyticsCard = memo(({ title, value, icon, sub, color }: any) => (
  <div 
    className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group h-full transition-all duration-500 hover:-translate-y-1 gpu-accel"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-primary-600 transition-all duration-500 shadow-lg`}>
        {icon}
      </div>
      <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5`}>
        Live Signal
      </div>
    </div>
    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className={`text-4xl font-black tracking-tighter mb-2 ${color || 'text-white'}`}>{value}</p>
    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{sub}</p>
    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
       {icon}
    </div>
  </div>
));
