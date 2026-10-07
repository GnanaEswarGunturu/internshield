import { useMemo } from 'react';
import { ShieldAlert, Fingerprint, Database, ArrowRight } from 'lucide-react';
import { loadHistory } from '../services/api';

const LEVEL_STYLES = {
  LOW: 'text-cyber-green bg-cyber-green/10',
  'LOW RISK': 'text-cyber-green bg-cyber-green/10',
  VERIFY: 'text-cyber-orange bg-cyber-orange/10',
  HIGH: 'text-cyber-red bg-cyber-red/10',
  'HIGH RISK': 'text-cyber-red bg-cyber-red/10',
};

export default function Dashboard({ setActiveTab }) {
  const history = useMemo(() => {
    const data = loadHistory();
    return Array.isArray(data) ? data : [];
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-6 pt-12 pb-8">
        <div className="inline-block p-4 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 mb-4 animate-pulse-slow">
          <ShieldAlert className="w-16 h-16 text-cyber-blue" />
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          InternShield
        </h1>
        <p className="text-xl text-cyber-teal font-mono max-w-2xl mx-auto">
          AI-Powered Job & Internship Scam Risk Detection
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4 hover:border-cyber-blue/40 transition-colors">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Fingerprint className="w-8 h-8 text-cyber-blue" />
          </div>
          <h3 className="text-lg font-semibold text-white">Multi-Layer Analysis</h3>
          <p className="text-sm text-slate-400">
            Fuses NLP text classification, URL heuristics, and contact pattern matching to detect fraudulent postings.
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4 hover:border-cyber-teal/40 transition-colors">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Database className="w-8 h-8 text-cyber-teal" />
          </div>
          <h3 className="text-lg font-semibold text-white">Explainable AI</h3>
          <p className="text-sm text-slate-400">
            Provides precise evidence for risk scores, identifying exact suspicious phrases and red flags.
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-slate-900 to-slate-800">
          <h3 className="text-xl font-bold text-white">Ready to scan?</h3>
          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className="w-full py-3 px-6 rounded-lg bg-cyber-blue hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all glow-blue"
          >
            Analyze a Job <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Recent Analyses</h2>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No analyses yet. Analyze a job posting to see results here.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-900/70 border border-slate-700"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{item.title || 'Untitled posting'}</p>
                  <p className="text-xs text-slate-400 truncate">{item.company || 'Unknown company'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-white">{Number.isFinite(Number(item.risk_score)) ? item.risk_score : '—'}/100</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${LEVEL_STYLES[item.risk_level] || 'text-slate-300 bg-slate-800'}`}>
                    {item.risk_level || 'VERIFY'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-8 mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">About the Research</h2>
        <div className="grid md:grid-cols-2 gap-8 text-slate-300">
          <div className="space-y-4">
            <p>
              <strong className="text-white">InternShield</strong> is an explainable multi-layer framework designed to protect students and job seekers from fraudulent employment opportunities.
            </p>
            <p>
              By utilizing a weighted feature-fusion approach, the system evaluates textual urgency, payment requests, unrealistic compensation, and suspicious contact patterns.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-cyber-blue mt-2"></div>
              <div>
                <h4 className="text-white font-medium">Text & NLP Processing</h4>
                <p className="text-sm text-slate-400">TF-IDF vectorization paired with Logistic Regression for text classification, with a rule-based fallback when a trained model is unavailable.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-cyber-blue mt-2"></div>
              <div>
                <h4 className="text-white font-medium">Heuristic Rule Engine</h4>
                <p className="text-sm text-slate-400">Detection of guaranteed jobs, upfront payments, and unsecured URLs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
