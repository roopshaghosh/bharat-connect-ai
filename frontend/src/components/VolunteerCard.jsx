import React from 'react';
import { Calendar, MapPin, Tag, Users, CheckCircle } from 'lucide-react';

const VolunteerCard = ({ opportunity, onApply, hasApplied, isOrg }) => {
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  };

  const isVirtual = opportunity.type === 'virtual';

  return (
    <div className={`glass-card p-6 rounded-2xl flex flex-col justify-between h-full border border-slate-800/80 hover:border-slate-700/80`}>
      <div>
        {/* Header Category and Type */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
            {opportunity.category || 'Other'}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
            isVirtual 
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {opportunity.type}
          </span>
        </div>

        {/* Title and Org */}
        <h3 className="text-lg font-bold text-white mb-1.5 hover:text-blue-400 transition-colors line-clamp-2" title={opportunity.title}>
          {opportunity.title}
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-semibold">
          hosted by <span className="text-slate-300 font-bold">{opportunity.organization?.name || 'Teach India NGO'}</span>
        </p>

        {/* Details list */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-slate-400 text-xs">
            <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
            <span>{formatDate(opportunity.date)}</span>
          </div>
          <div className="flex items-center text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500" />
            <span className="truncate">{opportunity.location}</span>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-3">
          {opportunity.description}
        </p>

        {/* Required Skills Pills */}
        <div className="mb-6">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
            <Tag className="w-3 h-3 mr-1 text-slate-500" /> Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.skillsRequired && opportunity.skillsRequired.map((skill, idx) => (
              <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between gap-3 mt-auto">
        <span className="text-[11px] text-slate-500 flex items-center">
          <Users className="w-3.5 h-3.5 mr-1" />
          {opportunity.volunteersApproved?.length || 0} approved
        </span>

        {isOrg ? (
          <span className="text-xs font-bold text-slate-500 italic">Hosting</span>
        ) : hasApplied ? (
          <button
            disabled
            className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-lg cursor-not-allowed"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Applied</span>
          </button>
        ) : (
          <button
            onClick={() => onApply(opportunity)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4.5 py-2 rounded-lg transition-all shadow-md shadow-blue-600/15"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default VolunteerCard;
