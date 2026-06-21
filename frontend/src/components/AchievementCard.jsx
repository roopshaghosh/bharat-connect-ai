import React from 'react';
import { Calendar } from 'lucide-react';

const AchievementCard = ({ badge }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex items-start space-x-4 border border-slate-800/80 hover:border-slate-700/80">
      {/* Icon frame */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
        {badge.icon || '🏆'}
      </div>
      
      {/* Details */}
      <div className="space-y-1 overflow-hidden">
        <h4 className="font-bold text-white text-sm tracking-wide truncate">{badge.title}</h4>
        <p className="text-slate-400 text-xs leading-relaxed">{badge.description}</p>
        
        {badge.unlockedAt && (
          <div className="flex items-center text-slate-500 text-[10px] pt-1">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Unlocked: {formatDate(badge.unlockedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;
