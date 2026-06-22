import React from 'react';
import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import { Users, ShieldAlert, Award, BrainCircuit, Heart, Handshake, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header */}
      <HeroSection />

      {/* Problem & Solution Split Section */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-5 leading-tight">
            The Problem: Scattered Opportunities <br />& Fragmented Impact
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Fragmented Discovery', desc: 'Causes are spread across unstructured WhatsApp groups, NGO portals, and Instagram pages.' },
              { label: 'Underutilized Skills', desc: 'Professionals want to teach, code, or design, but have no way to matching their skillsets to social tasks.' },
              { label: 'Delayed Emergencies', desc: 'Critical blood requests face fatal delays due to fragmented community communication.' }
            ].map((prob, idx) => (
              <div key={idx} className="flex items-start space-x-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-200 text-sm">{prob.label}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prob.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-5 leading-tight">
            The Solution: Bharat Connect AI
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            We offer a unified <strong>Social Impact Operating System</strong>. By indexing NGO opportunities, blood demands, and skills under one smart engine, we solve the matchmaking bottleneck.
          </p>

          {/* User journey chart visual */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Intelligent AI Flow</h4>
            <div className="relative border-l-2 border-indigo-500/30 pl-5 ml-2.5 space-y-5">
              {[
                { title: 'Create Profile', desc: 'Set your skills (e.g. Teaching, React.js), location, and availability tags.' },
                { title: 'AI Semantic Analysis', desc: 'The AI compares your tags with active NGO openings and emergency blood requests.' },
                { title: 'Personalized Matching', desc: 'Instantly view a curated dashboard with match percentages and reasons.' }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
                  <h5 className="font-bold text-sm text-white leading-tight">{step.title}</h5>
                  <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Core Pillars of Action</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Discover how Bharat Connect AI matches your specific interests with real-world impact channels.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Users}
            title="Volunteer Hub"
            description="Discover weekend activities, river cleanups, local teaching camps, and community support groups near your location."
            linkText="Discover Opportunities"
            linkTo="/volunteer-hub"
            borderClass="hover:border-blue-500/30"
          />
          <FeatureCard
            icon={Code}
            title="Skill Donation"
            description="Contribute professional skills like designing brochures, teaching coding classes, or building websites for NGOs virtually."
            linkText="Donate Skills"
            linkTo="/skill-donation"
            borderClass="hover:border-purple-500/30"
          />
          <FeatureCard
            icon={Heart}
            title="Blood Donation Network"
            description="Intelligently bridge critical emergencies. Post requests or receive notifications for matching blood types near you."
            linkText="View Blood Requests"
            linkTo="/blood-donation"
            borderClass="hover:border-red-500/30"
          />
        </div>
      </section>

      {/* Gamification & Achievements Highlights */}
      <section className="max-w-5xl mx-auto px-6 bg-gradient-to-tr from-slate-950 to-indigo-950/20 border border-slate-800/80 p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="md:flex-1">
          <div className="inline-flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 mb-4">
            <Award className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Gamified Progression Loop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Earn Badges, Stack XP, & Double Your Impact Score</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            We translate social good into tangible progression. Hosting events, applying to volunteer opportunities, or committing to blood emergencies earns you **Impact XP**. Unlock badges like "Life Saver" or "Community Champion" to feature on your profile.
          </p>
          <div className="flex gap-4">
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">🚀 Social Pioneer</span>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">👑 Profile Maestro</span>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">🩸 Life Saver</span>
          </div>
        </div>
        <div className="w-full md:w-80 flex justify-center shrink-0">
          <div className="w-56 h-56 rounded-full bg-indigo-500/5 border-2 border-dashed border-indigo-500/30 flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full bg-indigo-600/10 border border-indigo-500/50 flex flex-col items-center justify-center text-center shadow-lg shadow-indigo-500/10">
              <Award className="w-12 h-12 text-yellow-400 mb-2" />
              <span className="text-2xl font-black text-white">LEVEL UP</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">150+ XP</span>
            </div>
            <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg animate-bounce">🌟</div>
            <div className="absolute bottom-4 left-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg animate-pulse">👑</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
