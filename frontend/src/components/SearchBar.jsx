import React from 'react';
import { Search, MapPin, Grid, RefreshCw } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from '../utils/constants';

const SearchBar = ({ filters, onFilterChange, onSearch, onReset }) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row gap-4 items-center">
      {/* Query Search */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by keywords, title..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Category Dropdown */}
      <div className="relative w-full md:w-48">
        <Grid className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <select
          value={filters.category || 'All'}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {OPPORTUNITY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="relative w-full md:w-48">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by city..."
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filter Action Buttons */}
      <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
        <button
          onClick={onReset}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/50 hover:text-white transition-colors"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onSearch}
          className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/15"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
