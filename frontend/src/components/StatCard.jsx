import React from 'react';

const StatCard = ({ icon: Icon, value, label, subtext, color = 'blue' }) => {
  const colorMaps = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-slate-800/80">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMaps[color] || colorMaps.blue}`}>
        <Icon className="w-5.5 h-5.5" />
      </div>
      <div>
        <h4 className="text-2xl font-black text-white leading-tight">{value}</h4>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatCard;
