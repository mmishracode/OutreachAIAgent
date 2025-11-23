import React, { useState } from 'react';
import { Layout, Search, Users, Mail, BarChart3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SearchAgent from './components/SearchAgent';
import LeadsManager from './components/LeadsManager';
import { Lead, AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [leads, setLeads] = useState<Lead[]>([]);

  const addLeads = (newLeads: Lead[]) => {
    setLeads(prev => [...prev, ...newLeads]);
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard leads={leads} onViewChange={setCurrentView} />;
      case AppView.SEARCH:
        return <SearchAgent onLeadsFound={addLeads} onNavigateToLeads={() => setCurrentView(AppView.LEADS)} />;
      case AppView.LEADS:
        return <LeadsManager leads={leads} onUpdateStatus={updateLeadStatus} />;
      default:
        return <Dashboard leads={leads} onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            OA
          </div>
          <span className="font-bold text-lg text-slate-800">OutreachAI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Dashboard" 
            active={currentView === AppView.DASHBOARD} 
            onClick={() => setCurrentView(AppView.DASHBOARD)} 
          />
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Discovery Agent" 
            active={currentView === AppView.SEARCH} 
            onClick={() => setCurrentView(AppView.SEARCH)} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Leads & Outreach" 
            active={currentView === AppView.LEADS} 
            onClick={() => setCurrentView(AppView.LEADS)} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="text-xs text-slate-400 text-center">
            Powered by Gemini 2.5
          </div>
        </div>
      </aside>

      {/* Mobile Tab Bar (visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-4 z-50">
        <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`${currentView === AppView.DASHBOARD ? 'text-primary' : 'text-slate-400'}`}>
          <BarChart3 size={24} />
        </button>
        <button onClick={() => setCurrentView(AppView.SEARCH)} className={`${currentView === AppView.SEARCH ? 'text-primary' : 'text-slate-400'}`}>
          <Search size={24} />
        </button>
        <button onClick={() => setCurrentView(AppView.LEADS)} className={`${currentView === AppView.LEADS ? 'text-primary' : 'text-slate-400'}`}>
          <Users size={24} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full relative">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-20">
          <span className="font-bold text-lg text-slate-800">OutreachAI</span>
        </header>
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      active 
        ? 'bg-indigo-50 text-primary font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);