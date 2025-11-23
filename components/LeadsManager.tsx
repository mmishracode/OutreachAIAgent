
import React, { useState } from 'react';
import { Lead } from '../types';
import { Mail, Send, MoreVertical, Trash2, Sparkles, RefreshCw, FileSpreadsheet, Download, ExternalLink } from 'lucide-react';
import { generateColdEmail } from '../services/geminiService';

interface LeadsManagerProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: Lead['status']) => void;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, onUpdateStatus }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [userContext, setUserContext] = useState({
     name: 'Alex Johnson',
     offer: 'We help businesses scale their organic traffic by 300% in 90 days using AI-driven content strategies.'
  });

  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleLeadSelect = (lead: Lead) => {
      if (isGenerating) return;
      setSelectedLead(lead);
      setGeneratedEmail(lead.emailDraft || '');
      setGeneratedSubject(lead.emailSubject || '');
      setRecipientEmail(lead.email || '');
  }

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Name', 'Role', 'Email', 'Company/Description', 'Website', 'Status', 'Date Added', 'Email Subject', 'Email Body'];
    const rows = leads.map(l => {
        // Escape quotes and wrap fields in quotes to handle commas within fields
        const safe = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
        return [
            safe(l.name),
            safe(l.role),
            safe(l.email),
            safe(l.description),
            safe(l.sourceUrl || ''),
            safe(l.status),
            safe(l.dateAdded),
            safe(l.emailSubject || generatedSubject),
            safe(l.emailDraft || generatedEmail)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `outreach_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateEmail = async (lead: Lead) => {
    setSelectedLead(lead);
    setRecipientEmail(lead.email || ''); // Sync email on generate start if not manually edited yet
    setIsGenerating(true);
    setGeneratedEmail('');
    setGeneratedSubject('');
    
    const result = await generateColdEmail(
        lead.name,
        lead.description,
        userContext.offer,
        userContext.name
    );
    
    setGeneratedEmail(result.body);
    setGeneratedSubject(result.subject);
    setIsGenerating(false);
    onUpdateStatus(lead.id, 'DRAFTED');
  };

  const updateLeadEmail = (email: string) => {
      setRecipientEmail(email);
      // Ideally we should update the actual lead object in the parent state too, 
      // but for this demo, local state helps the flow.
      if (selectedLead) {
        selectedLead.email = email;
      }
  }

  const handleSendGmail = () => {
    if (!recipientEmail) {
        alert("Please enter a recipient email address.");
        return;
    }
    const subject = encodeURIComponent(generatedSubject || selectedLead?.emailSubject || "Hello");
    const body = encodeURIComponent(generatedEmail || selectedLead?.emailDraft || "");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`;
    
    window.open(gmailUrl, '_blank');
    if (selectedLead) onUpdateStatus(selectedLead.id, 'SENT');
  };

  const handleSendDefault = () => {
    if (!recipientEmail) {
        alert("Please enter a recipient email address.");
        return;
    }
    const subject = encodeURIComponent(generatedSubject || selectedLead?.emailSubject || "Hello");
    const body = encodeURIComponent(generatedEmail || selectedLead?.emailDraft || "");
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    
    window.open(mailtoUrl, '_blank');
    if (selectedLead) onUpdateStatus(selectedLead.id, 'SENT');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left: List */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Leads & Campaigns</h1>
            <button 
                onClick={handleExportCSV}
                disabled={leads.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
                <FileSpreadsheet size={16} />
                Export CSV
            </button>
        </div>
        
        {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No leads yet. Go to Discovery Agent to find some!</p>
            </div>
        ) : (
            <div className="space-y-3">
                {leads.map((lead) => (
                    <div 
                        key={lead.id} 
                        className={`bg-white p-4 rounded-xl border shadow-sm transition-all cursor-pointer hover:border-primary/30 ${selectedLead?.id === lead.id ? 'ring-2 ring-primary border-transparent' : 'border-slate-200'}`}
                        onClick={() => handleLeadSelect(lead)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800">{lead.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                        lead.status === 'NEW' ? 'bg-slate-100 text-slate-500' :
                                        lead.status === 'DRAFTED' ? 'bg-amber-100 text-amber-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {lead.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lead.description}</p>
                                {lead.email && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Mail size={10} /> {lead.email}</p>}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleGenerateEmail(lead); }}
                                className="text-primary hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                title="Generate Email"
                            >
                                <Sparkles size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Right: Detail / Email Composer */}
      <div className="w-1/2 bg-white rounded-xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
        {selectedLead ? (
            <>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                            <p className="text-sm text-slate-500">{selectedLead.role}</p>
                        </div>
                        <div className="flex gap-2">
                             {selectedLead.sourceUrl && (
                                 <a href={normalizeUrl(selectedLead.sourceUrl)} target="_blank" rel="noreferrer" className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-md text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
                                    Visit Website <ExternalLink size={12} />
                                 </a>
                             )}
                        </div>
                    </div>

                    {/* Email Recipient Input */}
                     <div className="mt-4">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Recipient Email</label>
                        <input 
                            type="email"
                            placeholder="Enter email address"
                            value={recipientEmail}
                            onChange={(e) => updateLeadEmail(e.target.value)}
                            className="w-full text-sm bg-white border border-slate-200 rounded p-2 text-slate-800 focus:border-primary outline-none"
                        />
                     </div>
                    
                    {/* User Context Inputs (Mini settings) */}
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                         <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Your Pitch / Offer Context</label>
                         <textarea 
                            value={userContext.offer}
                            onChange={(e) => setUserContext({...userContext, offer: e.target.value})}
                            className="w-full text-xs bg-white border border-slate-200 rounded p-2 text-slate-700 focus:border-primary outline-none resize-none"
                            rows={2}
                         />
                    </div>
                </div>

                {/* Body / Editor */}
                <div className="flex-1 p-6 overflow-y-auto bg-white relative">
                    {isGenerating ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                            <Loader2 className="animate-spin text-primary mb-4" size={32} />
                            <p className="text-slate-500 font-medium animate-pulse">AI is crafting the perfect email...</p>
                        </div>
                    ) : generatedEmail || selectedLead.status !== 'NEW' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                                <input 
                                    type="text"
                                    value={generatedSubject || selectedLead.emailSubject || ""}
                                    onChange={(e) => setGeneratedSubject(e.target.value)}
                                    className="w-full font-medium text-slate-800 border-b border-slate-100 py-2 focus:border-primary outline-none"
                                    placeholder="Email Subject"
                                />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <textarea 
                                    value={generatedEmail || selectedLead.emailDraft || "Click generate to create a draft."} 
                                    onChange={(e) => setGeneratedEmail(e.target.value)}
                                    className="w-full h-64 bg-transparent border-none focus:ring-0 text-slate-700 text-sm leading-relaxed resize-none outline-none"
                                    placeholder="Email content will appear here..."
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2 gap-2">
                                <button 
                                    onClick={() => handleGenerateEmail(selectedLead)}
                                    className="text-slate-500 hover:text-primary text-sm flex items-center gap-2"
                                >
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSendDefault}
                                        disabled={!generatedEmail || !recipientEmail}
                                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Open default mail app"
                                    >
                                        <Mail size={16} />
                                    </button>
                                    <button 
                                        onClick={handleSendGmail}
                                        disabled={!generatedEmail || !recipientEmail}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-red-100"
                                    >
                                        <Send size={16} />
                                        Send via Gmail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <Mail size={48} className="text-slate-200" />
                            <p>No email drafted yet.</p>
                            <button 
                                onClick={() => handleGenerateEmail(selectedLead)}
                                className="text-primary border border-primary/20 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                Generate First Draft
                            </button>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
                <MoreVertical size={48} className="opacity-20 mb-4" />
                <p>Select a lead to manage outreach</p>
            </div>
        )}
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default LeadsManager;
