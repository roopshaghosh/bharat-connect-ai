import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake, ArrowRight, Heart } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background glow dots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Floating Sparkle Alert */}
      <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400 mb-6 animate-pulse z-10">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Unified Social Impact Operating System</span>
      </div>

      {/* Hero Titles */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-white mb-6 leading-tight z-10">
        Connecting Hearts and Skills with <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
          AI-Powered Causes
        </span>
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed z-10">
        Bharat Connect AI brings volunteering drives, emergency blood requests, and professional skill donations into a single, gamified matching platform.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4.5 mb-16 z-10 w-full sm:w-auto px-4">
        <Link
          to="/volunteer-hub"
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <HeartHandshake className="w-5 h-5" />
          <span>Explore Volunteering</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
        <Link
          to="/blood-donation"
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-750 text-white font-bold px-7 py-3.5 rounded-xl border border-slate-700/60 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          <span>Emergency Blood Network</span>
        </Link>
      </div>

      {/* Visual Heuristics Stats Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl w-full z-10">
        {[
          { label: 'Active Volunteers', value: '1,200+' },
          { label: 'Volunteering Opportunities', value: '80+' },
          { label: 'Blood Requests Fulfilled', value: '250+' },
          { label: 'Impact Hours Contributed', value: '5,000+' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
              {stat.value}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
