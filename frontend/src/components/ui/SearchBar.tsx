'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search events, workshops, hackathons...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-300 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') onSearch('');
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 glass rounded-2xl text-white placeholder-slate-500 
            focus:outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-400/40
            transition-all duration-300 text-sm aurora-border"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 shadow-lg shadow-cyan-500/20"
        >
          Search
        </button>
      </div>
    </form>
  );
}
