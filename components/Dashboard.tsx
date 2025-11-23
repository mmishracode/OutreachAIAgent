import React from 'react';
import { Lead, AppView } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowRight, Mail, Search, Send } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, onViewChange }) => {
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    drafted: leads.filter(l => l.status === 'DRAFTED').length,
    sent: leads.filter(l => l.status === 'SENT').length,
  };

  const data = [
    { name: 'New', value: stats.new, color: '#94a3b8' },
    { name: 'Drafted', value: stats.drafted, color: '#fbbf24' },
    { name: 'Sent', value: stats.sent, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Command Center</h1>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <span className="text-slate-500 text-sm font-medium uppercase">Total Leads Found</span>
            <span className="text-4xl font-bold text-slate-800 mt-2">{stats.total}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <span className="text-slate-500 text-sm font-medium uppercase">Emails Drafted</span>
            <span className="text-4xl font-bold text-amber-500 mt-2">{stats.drafted}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <span className="text-slate-500 text-sm font-medium uppercase">Outreach Sent</span>
            <span className="text-4xl font-bold text-green-500 mt-2">{stats.sent}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => onViewChange(AppView.SEARCH)}
              className="w-full p-4 rounded-lg border border-slate-200 hover:border-primary hover:bg-indigo-50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-primary rounded-lg">
                  <Search size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-slate-800 group-hover:text-primary">Find New Leads</h3>
                  <p className="text-sm text-slate-500">Use AI Agent to search web</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-primary" />
            </button>

            <button 
              onClick={() => onViewChange(AppView.LEADS)}
              className="w-full p-4 rounded-lg border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-slate-800 group-hover:text-green-600">Manage Outreach</h3>
                  <p className="text-sm text-slate-500">Review drafts and send emails</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-green-600" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pipeline Status</h2>
          {stats.total === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <p>No data yet. Start searching!</p>
             </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
