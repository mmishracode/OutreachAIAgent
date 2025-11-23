
import React, { useState } from 'react';
import { Search, Loader2, Sparkles, CheckCircle2, ExternalLink, UserPlus, ArrowRight, Target, Globe, Mail } from 'lucide-react';
import { findLeadsWithAgent, parseLeadsFromText } from '../services/geminiService';
import { Lead, GroundingSource } from '../types';

interface SearchAgentProps {
  onLeadsFound: (leads: Lead[]) => void;
  onNavigateToLeads: () => void;
}

const SearchAgent: React.FC<SearchAgentProps> = ({ onLeadsFound, onNavigateToLeads }) => {
  const [criteria, setCriteria] = useState({
    role: 'Marketing Agencies',
    niche: 'Real Estate',
    location: 'New York',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [parsedLeads, setParsedLeads] = useState<Partial<Lead>[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setRawResult(null);
    setSources([]);
    setParsedLeads([]);
    setSavedIndices(new Set());

    try {
      // Step 1: Search Web
      const result = await findLeadsWithAgent(criteria.role, criteria.niche, criteria.location);
      setRawResult(result.rawText);
      setSources(result.sources);
      setIsSearching(false);

      // Step 2: Parse Text to Objects (Auto)
      setIsParsing(true);
      // Pass sources to parser to help with URL resolution
      const parsed = await parseLeadsFromText(result.rawText, result.sources);
      
      // Map parsed structure to Lead structure
      const mappedLeads = parsed.map((p: any) => ({
        name: p.name,
        role: p.role,
        description: p.description,
        sourceUrl: p.website, // Use the specific website extracted by AI
        email: p.email // Use extracted email if found
      }));
      
      setParsedLeads(mappedLeads);
    } catch (error) {
      console.error(error);
      alert("Failed to find leads. Please check your API Key.");
    } finally {
      setIsSearching(false);
      setIsParsing(false);
    }
  };

  const saveLead = (index: number, leadData: any) => {
    if (savedIndices.has(index)) return;

    // Logic: Use extracted website. If missing, try to fuzzy match a source title to the name.
    let finalUrl = leadData.sourceUrl;

    if (!finalUrl && sources.length > 0) {
        // Try to find a source where the title includes the lead's name
        const match = sources.find(s => s.title && s.title.toLowerCase().includes(leadData.name.toLowerCase()));
        if (match) {
            finalUrl = match.uri;
        }
    }

    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: leadData.name,
      role: leadData.role || criteria.role,
      description: leadData.description,
      status: 'NEW',
      dateAdded: new Date().toISOString(),
      sourceUrl: finalUrl,
      email: leadData.email
    };

    onLeadsFound([newLead]);
    setSavedIndices(prev => new Set(prev).add(index));
  };

  const saveAll = () => {
    parsedLeads.forEach((lead, idx) => saveLead(idx, lead));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Header Section */}
      <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900">Discovery Agent</h1>
          <p className="text-slate-500 mt-2 text-lg">Deploy an AI agent to scout the web for your ideal prospects.</p>
      </div>

      {/* Mission Control (Search Form) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <Target className="text-primary" />
             <h2 className="font-semibold text-slate-800">Agent Mission Parameters</h2>
        </div>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Profile</label>
            <div className="relative">
                <select 
                value={criteria.role}
                onChange={(e) => setCriteria({...criteria, role: e.target.value})}
                className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4 text-slate-800 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium"
                >
                    <option value="Influencers">Influencers</option>
                    <option value="Marketing Agencies">Marketing Agencies</option>
                    <option value="Online Coaches">Online Coaches</option>
                    <option value="Content Creators">Content Creators</option>
                    <option value="Consultants">Consultants</option>
                    <option value="Small Business Owners">Small Business Owners</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Industry / Niche</label>
            <input 
              type="text"
              placeholder="e.g. Fitness, SaaS, Real Estate"
              value={criteria.niche}
              onChange={(e) => setCriteria({...criteria, niche: e.target.value})}
              className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium placeholder:font-normal"
              required
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location (Optional)</label>
            <input 
              type="text"
              placeholder="e.g. Los Angeles, Remote"
              value={criteria.location}
              onChange={(e) => setCriteria({...criteria, location: e.target.value})}
              className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium placeholder:font-normal"
            />
          </div>

          <div className="md:col-span-12 flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-primary hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 disabled:opacity-70 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:translate-y-[-1px]"
            >
              {isSearching ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {isSearching ? 'Agent is Scouting...' : 'Launch Search Mission'}
            </button>
          </div>
        </form>
      </div>

      {/* Empty State / Educational Content */}
      {!isSearching && !isParsing && parsedLeads.length === 0 && !rawResult && (
        <div className="py-12">
            <h3 className="text-center text-slate-400 font-medium mb-12">HOW THE AGENT WORKS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Globe className="text-blue-500" size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">1. Live Web Search</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">The agent connects to Google Search to find real, active businesses matching your specific criteria.</p>
                </div>
                <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="text-primary" size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">2. Lead Extraction</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">It parses unstructured web data into clean profiles with names, descriptions, and verified links.</p>
                </div>
                <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Mail className="text-green-500" size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">3. Instant Outreach</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Add leads to your campaign manager to automatically generate personalized cold emails.</p>
                </div>
            </div>
        </div>
      )}

      {/* Search Progress */}
      {isSearching && (
         <div className="py-20 text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="text-primary opacity-50" size={32} />
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Scouring the web...</h3>
                <p className="text-slate-500 mt-2">Locating {criteria.role} in {criteria.niche}</p>
            </div>
         </div>
      )}

      {isParsing && (
         <div className="py-20 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="text-green-600" size={40} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Analyzing Intel...</h3>
                <p className="text-slate-500 mt-2">Extracting contact details and verifying sources</p>
            </div>
         </div>
      )}

      {/* Results View */}
      {!isSearching && !isParsing && parsedLeads.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Mission Success</h2>
                    <p className="text-slate-600">Identified <span className="font-bold text-primary">{parsedLeads.length}</span> potential candidates for your campaign.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={saveAll}
                        disabled={savedIndices.size === parsedLeads.length}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                    >
                        {savedIndices.size === parsedLeads.length ? 'All Saved' : 'Save All Candidates'}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedLeads.map((lead, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between group ${savedIndices.has(idx) ? 'border-green-200 shadow-none bg-green-50/30' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30'}`}>
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{lead.name}</h3>
                                <div className="flex gap-2">
                                  {lead.sourceUrl && (
                                      <a href={normalizeUrl(lead.sourceUrl)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors" title="Visit Website">
                                          <ExternalLink size={16} />
                                      </a>
                                  )}
                                  {lead.email && (
                                     <a href={`mailto:${lead.email}`} className="text-slate-400 hover:text-green-500 transition-colors" title="Send Email">
                                        <Mail size={16} />
                                     </a>
                                  )}
                                </div>
                            </div>
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium mb-3">{lead.role || criteria.role}</span>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">{lead.description}</p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => saveLead(idx, lead)}
                                disabled={savedIndices.has(idx)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    savedIndices.has(idx) 
                                    ? 'bg-green-100 text-green-700 cursor-default' 
                                    : 'bg-slate-900 text-white hover:bg-primary shadow-lg shadow-slate-200'
                                }`}
                            >
                                {savedIndices.has(idx) ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>Saved to Leads</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        <span>Add to Campaign</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Floating Action Bar - Only appears if leads are saved */}
      {savedIndices.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="bg-slate-900 text-white p-2 pl-6 pr-2 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700">
                  <span className="font-medium">{savedIndices.size} leads ready for outreach</span>
                  <button 
                    onClick={onNavigateToLeads}
                    className="bg-primary hover:bg-indigo-600 text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
                  >
                      Proceed to Campaign <ArrowRight size={18} />
                  </button>
              </div>
          </div>
      )}

      {/* Fallback Raw Text Display */}
      {!isSearching && !isParsing && rawResult && parsedLeads.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Raw Intelligence</h3>
            <div className="prose prose-slate max-w-none text-sm bg-slate-50 p-6 rounded-xl border border-slate-100">
                <pre className="whitespace-pre-wrap font-sans text-slate-600">{rawResult}</pre>
            </div>
            {sources.length > 0 && (
                 <div className="mt-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Verified Sources</h4>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((s, i) => (
                            <a key={i} href={normalizeUrl(s.uri)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all max-w-[200px] truncate">
                                <Globe size={12} className="shrink-0" />
                                <span className="truncate">{s.title || 'Source Link'}</span>
                            </a>
                        ))}
                    </div>
                 </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchAgent;
