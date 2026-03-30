import { memo } from 'react';

const ActivityFeed = memo(({ activities }: { activities: any[] }) => {
  return (
    <div className="glass rounded-[2rem] p-6 lg:p-8 border-white/5 min-h-[300px] bg-white/[0.01]">
        <div className="space-y-6">
            {activities.length === 0 ? (
                <p className="text-center py-10 text-gray-600 font-bold uppercase text-[10px] tracking-widest italic">NO PULSES</p>
            ) : (
                activities.map((act) => (
                    <div key={act.id} className="flex gap-4 group">
                        <div className={`w-1.5 h-8 rounded-full transition-colors ${act.type === 'UPLOAD' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight italic line-clamp-1 group-hover:text-primary-400 transition-colors">
                                {act.message}
                            </p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                {new Date(act.createdAt).toLocaleTimeString()} • {act.type}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
});

export default ActivityFeed;
