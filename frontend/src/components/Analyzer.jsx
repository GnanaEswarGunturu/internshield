import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyzeJob, appendHistory } from '../services/api';

const LEVEL_LABELS = {
  LOW: 'LOW RISK',
  VERIFY: 'VERIFY',
  HIGH: 'HIGH RISK',
  'LOW RISK': 'LOW RISK',
  'HIGH RISK': 'HIGH RISK',
};

const DEMO_SCAM = {
  title: 'Software Developer Internship',
  description:
    'Congratulations! You have been selected for our Software Developer Internship. No interview required. Earn ₹75,000 per month working from home. To confirm your position, pay a refundable registration fee of ₹2,999 within 24 hours. Send your Aadhaar card and bank account details to complete verification. Limited seats available. Pay immediately to secure your position.',
  company: 'Global Tech Careers',
  website: 'globaltech.wixsite.com',
  email: 'recruitment@yahoo.com',
  salary: '75000',
  url: 'http://globaltech.wixsite.com/jobs',
};

const DEMO_LEGIT = {
  title: 'Software Engineering Intern',
  description:
    'We are looking for a Software Engineering Intern. Candidates will be shortlisted based on resume and technical assessment, followed by an interview. Monthly stipend will be provided according to company policy. Applications must be submitted through the official careers portal. No registration fee or payment is required.',
  company: 'Example Technologies',
  website: 'https://exampletech.com',
  email: 'careers@exampletech.com',
  salary: 'Stipend based',
  url: 'https://exampletech.com/jobs',
};

function safeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  const percent = number <= 1 ? number * 100 : number;
  return `${percent.toFixed(1)}%`;
}

function normalizeResult(data) {
  const evidence = Array.isArray(data?.evidence)
    ? data.evidence.map((item) =>
        typeof item === 'string'
          ? { text: item, category: 'Signal', impact: '+ risk' }
          : {
              text: item?.text ?? 'Unspecified signal',
              category: item?.category ?? 'Signal',
              impact: item?.impact ?? '+ risk',
            }
      )
    : [];

  const recommendations = Array.isArray(data?.recommendations)
    ? data.recommendations.filter(Boolean)
    : [];

  const level = String(data?.risk_level ?? 'VERIFY').toUpperCase();

  return {
    risk_score: safeScore(data?.risk_score),
    risk_level: LEVEL_LABELS[level] ? level.replace(' RISK', '') : 'VERIFY',
    prediction: data?.prediction || 'Unavailable',
    confidence: data?.confidence,
    text_risk: safeScore(data?.text_risk),
    url_risk: safeScore(data?.url_risk),
    contact_risk: safeScore(data?.contact_risk),
    scam_pattern_risk: safeScore(data?.scam_pattern_risk),
    evidence,
    recommendations,
    model_available: Boolean(data?.model_available),
  };
}

export default function Analyzer() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    website: '',
    email: '',
    salary: '',
    url: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [demoMode, setDemoMode] = useState(false);
  const [demoStage, setDemoStage] = useState(0);
  const stages = [
    'Initializing multi-layer framework...',
    'Preprocessing text...',
    'Extracting NLP features...',
    'Analyzing URL heuristics...',
    'Verifying contact integrity...',
    'Applying feature fusion...',
    'Classifying risk score...',
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadDemoScam = () => {
    setError(null);
    setResult(null);
    setFormData(DEMO_SCAM);
  };

  const loadDemoLegit = () => {
    setError(null);
    setResult(null);
    setFormData(DEMO_LEGIT);
  };

  const runAnalysis = async () => {
    if (!formData.description?.trim()) {
      setError('Job description is required for analysis.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      if (demoMode) {
        for (let i = 0; i < stages.length; i++) {
          setDemoStage(i);
          await new Promise((r) => setTimeout(r, 400));
        }
      }

      const data = await analyzeJob(formData);
      const normalized = normalizeResult(data);
      setResult(normalized);
      appendHistory({
        id: Date.now(),
        title: formData.title || 'Untitled posting',
        company: formData.company || 'Unknown company',
        risk_score: normalized.risk_score,
        risk_level: normalized.risk_level,
        prediction: normalized.prediction,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to the analysis server. Please make sure the FastAPI backend is running on port 8000.'
      );
    } finally {
      setLoading(false);
      setDemoStage(0);
    }
  };

  const displayLevel = result
    ? LEVEL_LABELS[result.risk_level] || result.risk_level
    : '';

  const getRiskColor = (level) => {
    const key = String(level || '').replace(' RISK', '');
    if (key === 'HIGH') return 'text-cyber-red glow-red border-cyber-red';
    if (key === 'VERIFY') return 'text-cyber-orange glow-orange border-cyber-orange';
    return 'text-cyber-green glow-green border-cyber-green';
  };

  const getRiskBg = (level) => {
    const key = String(level || '').replace(' RISK', '');
    if (key === 'HIGH') return 'bg-cyber-red/10';
    if (key === 'VERIFY') return 'bg-cyber-orange/10';
    return 'bg-cyber-green/10';
  };

  const chartData = result
    ? [
        { name: 'Text', value: result.text_risk, max: 35 },
        { name: 'URL', value: result.url_risk, max: 20 },
        { name: 'Contact', value: result.contact_risk, max: 15 },
        { name: 'Scam', value: result.scam_pattern_risk, max: 30 },
      ].filter((item) => Number.isFinite(item.value))
    : [];

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6 min-w-0">
        <div className="glass-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyber-blue" />
              Job Input
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadDemoLegit}
                className="text-xs px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Demo Legit
              </button>
              <button
                type="button"
                onClick={loadDemoScam}
                className="text-xs px-3 py-1 rounded bg-cyber-red/20 hover:bg-cyber-red/30 border border-cyber-red/30 text-red-200 transition-colors"
              >
                Demo Scam
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Job / Internship Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Salary / Stipend</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="Paste the full job description here..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Company Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Recruiter Email</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono uppercase">Job URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={() => setDemoMode(!demoMode)}
                  className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-cyber-blue focus:ring-cyber-blue focus:ring-offset-slate-900"
                />
                Enable Live Demo Mode
              </label>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading}
                className="sm:ml-auto px-6 py-2 bg-cyber-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-all glow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Analyze Posting'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded bg-red-900/30 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        {loading && demoMode && (
          <div className="glass-panel p-8 flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-700 border-t-cyber-blue rounded-full animate-spin"></div>
              <Shield className="w-8 h-8 text-cyber-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white tracking-wider font-mono">ANALYSIS IN PROGRESS</h3>
              <p className="text-cyber-teal font-mono text-sm animate-pulse">{stages[demoStage]}</p>
            </div>
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-cyber-blue h-1.5 transition-all duration-500 ease-out"
                style={{ width: `${((demoStage + 1) / stages.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {loading && !demoMode && (
          <div className="glass-panel p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 className="w-12 h-12 text-cyber-blue animate-spin mb-4" />
            <p className="text-slate-400 font-mono">Analyzing...</p>
          </div>
        )}

        {!loading && !result && (
          <div className="glass-panel p-8 flex flex-col items-center justify-center h-full min-h-[400px] border-dashed border-2 border-slate-700/50 bg-transparent shadow-none">
            <Shield className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-500">Awaiting Job Data</h3>
            <p className="text-sm text-slate-600 mt-2 text-center max-w-xs">
              Enter posting details and click Analyze to view risk assessment.
            </p>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className={`glass-panel p-6 border-t-4 ${getRiskColor(result.risk_level).split(' ')[0].replace('text-', 'border-')}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-1">Overall Risk Score</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{result.risk_score}</span>
                    <span className="text-xl text-slate-500">/ 100</span>
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getRiskBg(result.risk_level)} ${getRiskColor(result.risk_level).split(' ')[0]}`}>
                    {result.risk_level === 'LOW' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {displayLevel}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs font-mono text-slate-500 mb-1 uppercase">Model Prediction</div>
                  <div className="text-lg font-bold text-white">{result.prediction}</div>
                  <div className="text-xs text-cyber-teal mt-1">Confidence: {formatConfidence(result.confidence)}</div>
                  {!result.model_available && (
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Rule-based fallback (model unavailable)</div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyber-blue" />
                Risk Breakdown
              </h3>

              {chartData.length === 0 ? (
                <p className="text-sm text-slate-400">Chart data is unavailable for this analysis.</p>
              ) : (
                <>
                  <div className="h-48 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 35]} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Text / NLP Risk', val: result.text_risk, max: 35 },
                      { label: 'URL Risk', val: result.url_risk, max: 20 },
                      { label: 'Contact Mismatch', val: result.contact_risk, max: 15 },
                      { label: 'Scam Patterns', val: result.scam_pattern_risk, max: 30 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="text-slate-400">
                            {item.val} / {item.max}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${item.val > item.max * 0.6 ? 'bg-cyber-red' : item.val > 0 ? 'bg-cyber-orange' : 'bg-cyber-green'}`}
                            style={{ width: `${Math.min(100, (item.val / item.max) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyber-red" />
                Detected Evidence
              </h3>

              {result.evidence.length > 0 ? (
                <div className="space-y-3">
                  {result.evidence.map((ev, idx) => (
                    <div key={`${ev.category}-${idx}`} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-cyber-red"></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 font-medium break-words">{ev.text}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{ev.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red">{ev.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-cyber-green/5 border border-cyber-green/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyber-green" />
                  <p className="text-sm text-slate-300">No major suspicious patterns detected.</p>
                </div>
              )}
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Recommendations</h3>
              {result.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-cyber-blue mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No recommendations were returned for this analysis.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
