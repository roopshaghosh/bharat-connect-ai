import React from 'react';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-slate-900 mt-auto py-6 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p>&copy; {new Date().getFullYear()} Bharat Connect AI. Built for Social Good.</p>
        <p className="text-[10px] text-slate-600 mt-1">A Social Impact Operating System powered by AI matching.</p>
      </div>
      <div className="flex space-x-5 font-semibold text-slate-400">
        <a href="#github" className="hover:text-white transition-colors">GitHub</a>
        <a href="#about" className="hover:text-white transition-colors">About Us</a>
        <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;
