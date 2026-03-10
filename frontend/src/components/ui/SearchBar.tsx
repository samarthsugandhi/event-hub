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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') onSearch('');
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 glass rounded-2xl text-white placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50
            transition-all duration-300 text-sm"
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
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-white text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
