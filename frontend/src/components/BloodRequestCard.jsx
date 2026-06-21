import React from 'react';
import { Phone, MapPin, Hospital, Clock, Heart, Users, Check } from 'lucide-react';

const BloodRequestCard = ({ request, onRespond, hasResponded, isOwner }) => {
  const isCritical = request.urgency === 'critical';
  const isHigh = request.urgency === 'high';
  const isPending = request.status === 'pending';

  const urgencyColors = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/30 font-extrabold',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div
      className={`glass-card p-6 rounded-2xl relative overflow-hidden transition-all ${
        isPending && isCritical ? 'border-red-500/40 neon-border-red animate-pulse-ring' : 'border-slate-800'
      }`}
    >
      {/* Background blood drop watermarks */}
      <div className="absolute top-2 right-2 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header blood group badge & Urgency */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          {/* Blood group indicator */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex flex-col items-center justify-center text-white shadow-lg shadow-red-500/20 font-black">
            <span className="text-xl leading-none">{request.bloodGroup}</span>
            <span className="text-[9px] uppercase font-bold mt-0.5 tracking-wider">Group</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Patient: {request.patientName}</h3>
            <p className="text-xs text-slate-400 mt-1">Needed: <span className="text-white font-extrabold">{request.unitsNeeded} Units</span></p>
          </div>
        </div>

        {/* Urgency Badge */}
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${urgencyColors[request.urgency] || urgencyColors.medium}`}>
          {request.urgency}
        </span>
      </div>

      {/* Patient Location Info */}
      <div className="space-y-2 mb-6">
        <div className="flex items-start text-slate-400 text-xs">
          <Hospital className="w-3.5 h-3.5 mr-2 text-red-500 shrink-0 mt-0.5" />
          <span className="font-semibold text-slate-300">{request.hospital}</span>
        </div>
        <div className="flex items-start text-slate-400 text-xs">
          <MapPin className="w-3.5 h-3.5 mr-2 text-red-500 shrink-0 mt-0.5" />
          <span>{request.location}</span>
        </div>
        <div className="flex items-center text-slate-400 text-xs">
          <Phone className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
          <a href={`tel:${request.contactNumber}`} className="hover:underline hover:text-white transition-colors">{request.contactNumber}</a>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500 flex items-center font-medium">
          <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {request.responses?.length || 0} responded
        </span>

        {!isPending ? (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            Fulfilled ✅
          </span>
        ) : isOwner ? (
          <span className="text-xs font-bold text-slate-500 italic">Your Request</span>
        ) : hasResponded ? (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" />
            <span>Committed</span>
          </span>
        ) : (
          <button
            onClick={() => onRespond(request._id || request.id)}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-red-600/15"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>I Can Donate</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BloodRequestCard;
