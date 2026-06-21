import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit, Heart, Handshake } from 'lucide-react';

const RecommendationCard = ({ recommendation, opportunity, bloodRequest, onView }) => {
  const isVol = !!opportunity;
  const matchScore = recommendation.matchScore || 50;

  // Color match score
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    if (score >= 60) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-purple-500/30 relative overflow-hidden ai-match-card flex flex-col justify-between h-full">
      {/* Background AI circuit glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Card Header Match Score */}
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center space-x-1.5 text-xs text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI MATCH</span>
          </span>

          <span className={`text-xs font-black px-3 py-1 rounded-full border ${getScoreColor(matchScore)}`}>
            {matchScore}% Match
          </span>
        </div>

        {/* Title */}
        {isVol ? (
          <>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2.5 font-bold">
              <Handshake className="w-3.5 h-3.5 text-blue-400" />
              <span>Volunteering Opportunity</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2 line-clamp-2" title={opportunity.title}>
              {opportunity.title}
            </h4>
            <p className="text-xs text-slate-400 mb-4 truncate">
              hosted by {opportunity.organization?.name || 'Teach India NGO'} • {opportunity.location}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2.5 font-bold">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Blood Request</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2 leading-tight">
              Needs {bloodRequest?.bloodGroup} blood for {bloodRequest?.patientName}
            </h4>
            <p className="text-xs text-slate-400 mb-4 truncate">
              at {bloodRequest?.hospital} • {bloodRequest?.location}
            </p>
          </>
        )}

        {/* AI Reason explanation */}
        <div className="bg-purple-950/20 border border-purple-900/30 p-3.5 rounded-xl mb-6">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Match Logic Reason
          </p>
          <p className="text-slate-300 text-xs leading-relaxed italic">
            "{recommendation.matchReason}"
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => onView(isVol ? { type: 'opp', data: opportunity } : { type: 'blood', data: bloodRequest })}
        className="flex items-center justify-center space-x-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/15 group w-full"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default RecommendationCard;
