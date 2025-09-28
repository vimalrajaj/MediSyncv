import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { resolveApiUrl } from '../../../config/api';

const SearchInput = ({ onSearch, onSelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // Real-time search using backend API
  const searchTerminologies = async (query) => {
    if (!query || query.length < 2) return [];
    // Abort previous request if still in-flight
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setInternalLoading(true);
      setError(null);
      const url = resolveApiUrl(`/api/v1/terminology/search?query=${encodeURIComponent(query)}&system=ALL&limit=10`);
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        console.error('Search API failed:', response.status, url);
        setError(`Server responded ${response.status}`);
        return [];
      }
      const data = await response.json();
      return (data.results || []).map((result, index) => ({
        id: result.code || `${result.system}_${Date.now()}_${index}`,
        code: result.code,
        display: result.display,
        system: result.system,
        confidence: Math.round((result.confidence || 0.8) * 100),
        description: result.definition || result.display,
        icd11: result.icd11Mapping ? {
          code: result.icd11Mapping.code,
          display: result.icd11Mapping.display,
          confidence: Math.round((result.icd11Mapping.confidence || 0.8) * 100)
        } : null,
        biomedical: result.biomedicalMapping ? {
          code: result.biomedicalMapping.code,
          display: result.biomedicalMapping.display,
          description: result.biomedicalMapping.description,
          confidence: Math.round((result.biomedicalMapping.confidence || 0.8) * 100)
        } : null
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error searching terminologies:', err);
        setError('Network error – check backend service');
      }
      return [];
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchTerminologies(searchTerm);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
      if (onSearch) onSearch(searchTerm, results);
    }, 250); // debounce interval
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions?.length === 0) return;

    switch (e?.key) {
      case 'ArrowDown':
        e?.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions?.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e?.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions?.length - 1
        );
        break;
      case 'Enter':
        e?.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions?.[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (terminology) => {
    setSearchTerm(terminology?.display);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect(terminology);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 90) return 'bg-success/10';
    if (confidence >= 80) return 'bg-warning/10';
    return 'bg-error/10';
  };

  // Highlight matched part of suggestion display text
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'ig'));
      return parts.map((part, i) => (
        part.toLowerCase() === searchTerm.toLowerCase() ?
          <mark key={i} className="bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-700 font-semibold rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      ));
    } catch {
      return text;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Gradient Feature Wrapper */}
      <div className="relative group rounded-2xl p-[2px] bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 shadow-[0_0_0_3px_rgba(255,255,255,0.5)]">
        <div className="rounded-2xl bg-white dark:bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-white/60 dark:border-white/10 relative">
          <div className="flex items-start justify-between px-3 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent uppercase">Core Feature</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200 font-medium">Smart Diagnosis</span>
            </div>
            <span className="hidden md:inline text-[10px] text-gray-500 font-medium">Type ≥ 2 characters</span>
          </div>
          <div className="relative px-3 pb-4">
            <Input
              type="text"
              placeholder="Search NAMASTE codes, symptoms, or conditions..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
              aria-controls="diagnosis-suggestions"
              className="pr-12 h-12 text-base rounded-xl border-transparent focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-0 shadow-inner bg-gradient-to-r from-teal-50 via-white to-indigo-50"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 mt-1 flex items-center">
              {(isLoading || internalLoading) ? (
                <Icon name="Loader2" size={22} className="animate-spin text-teal-600" />
              ) : (
                <Icon name="Search" size={22} className="text-indigo-600 opacity-80" />
              )}
            </div>
            {/* Subtle animated glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-teal-500/10 group-hover:ring-indigo-500/30 transition-shadow" />
          </div>
        </div>
      </div>
      {showSuggestions && suggestions?.length > 0 && (
        <div
          ref={suggestionsRef}
          id="diagnosis-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-teal-200/60 dark:border-border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto ring-1 ring-indigo-500/10"
        >
          <div className="sticky top-0 bg-gradient-to-r from-teal-50 to-indigo-50 px-3 py-2 border-b border-teal-100/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-teal-700">Smart Suggestions</span>
            <span className="text-[10px] text-gray-500">{suggestions.length} results</span>
          </div>
          <div className="p-2 space-y-1">
            {suggestions?.map((suggestion, index) => (
              <div
                key={suggestion?.id}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 rounded-lg cursor-pointer border border-transparent transition-all duration-150 ${index === selectedIndex
                  ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md'
                  : 'hover:bg-teal-50/70 dark:hover:bg-muted/40'}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm leading-tight line-clamp-2">{highlight(suggestion?.display)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tracking-wide font-mono ${index === selectedIndex ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>{suggestion?.code}</span>
                    </div>
                    {suggestion?.description && (
                      <p className={`text-[11px] mb-2 leading-snug ${index === selectedIndex ? 'text-white/85' : 'text-gray-600 dark:text-gray-400'}`}>{highlight(suggestion?.description)}</p>
                    )}
                    <div className="flex flex-col gap-1">
                      {suggestion?.icd11 && (
                        <div className={`flex items-center gap-1 text-[11px] ${index === selectedIndex ? 'text-white/90' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          <Icon name="ArrowRight" size={12} />
                          <span className="font-medium">TM2:</span>
                          <span className="font-mono">{suggestion?.icd11?.code}</span>
                          <span className="truncate">{highlight(suggestion?.icd11?.display)}</span>
                        </div>
                      )}
                      {suggestion?.biomedical && (
                        <div className={`flex items-center gap-1 text-[11px] ${index === selectedIndex ? 'text-white/90' : 'text-purple-600 dark:text-purple-400'}`}>
                          <Icon name="ArrowRight" size={12} />
                          <span className="font-medium">Biomedical:</span>
                          <span className="font-mono">{suggestion?.biomedical?.code}</span>
                          <span className="truncate">{highlight(suggestion?.biomedical?.display)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={`px-2 py-1 rounded text-[10px] font-semibold shadow-sm ${index === selectedIndex ? 'bg-white/25 text-white' : `${getConfidenceBg(suggestion?.confidence)} ${getConfidenceColor(suggestion?.confidence)} border border-white/40`}`}>{suggestion?.confidence}%</div>
                    {suggestion?.icd11 && (
                      <div className={`px-2 py-1 rounded text-[10px] font-medium ${index === selectedIndex ? 'bg-white/20 text-white' : `${getConfidenceBg(suggestion?.icd11?.confidence)} ${getConfidenceColor(suggestion?.icd11?.confidence)}`}`}>TM2: {suggestion?.icd11?.confidence}%</div>
                    )}
                    {suggestion?.biomedical && (
                      <div className={`px-2 py-1 rounded text-[10px] font-medium ${index === selectedIndex ? 'bg-white/20 text-white' : `${getConfidenceBg(suggestion?.biomedical?.confidence)} ${getConfidenceColor(suggestion?.biomedical?.confidence)}`}`}>Bio: {suggestion?.biomedical?.confidence}%</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showSuggestions && suggestions?.length === 0 && searchTerm?.length >= 2 && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg clinical-shadow-lg z-50">
          <div className="p-4 text-center text-text-secondary">
            <Icon name="Search" size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No matching terminologies found</p>
            <p className="text-xs mt-1">Try different keywords or check spelling</p>
          </div>
        </div>
      )}
      {error && searchTerm?.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-error/30 text-error rounded-lg clinical-shadow-lg z-50">
          <div className="p-4 text-center">
            <Icon name="AlertTriangle" size={20} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Search failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;