import { useState } from 'react';
import { Shield, Activity, BarChart2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import Research from './components/Research';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-300 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyber-blue" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">InternShield</h1>
              <p className="text-[10px] text-cyber-teal uppercase tracking-widest font-mono">Risk Detection Engine</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 flex-wrap">
            <button 
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard' ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analyzer' ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Job Analyzer
              </div>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('research')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'research' ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Research Data
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <ErrorBoundary>
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'analyzer' && <Analyzer />}
          {activeTab === 'research' && <Research />}
        </ErrorBoundary>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 font-mono">
          <p>InternShield Project • G. Gnana Eswar & P. Akshaya • Bapatla Engineering College</p>
          <p className="mt-1">Razzle Review, RVR & JC Engineering College</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
