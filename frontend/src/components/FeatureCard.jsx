import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, linkText, linkTo, borderClass = '' }) => {
  return (
    <div className={`glass-card p-6 rounded-2xl flex flex-col justify-between h-full ${borderClass}`}>
      <div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>
      </div>
      <Link
        to={linkTo}
        className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group mt-auto"
      >
        <span>{linkText}</span>
        <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default FeatureCard;
