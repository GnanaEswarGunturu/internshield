import { useState, useEffect } from 'react';
import { Database, BrainCircuit, Activity, Network } from 'lucide-react';
import { getMetrics } from '../services/api';

function metricPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const percent = number <= 1 ? number * 100 : number;
  return percent;
}

export default function Research() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMetrics()
      .then((data) => {
        if (cancelled) return;
        if (!data || data.error) {
          setMetrics(null);
          setError(data?.error || 'Metrics unavailable — run the training pipeline.');
          return;
        }
        setMetrics(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setMetrics(null);
        setError('Metrics unavailable — run the training pipeline.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isSynthetic =
    metrics?.dataset_type === 'synthetic_demo' ||
    metrics?.validated_research === false;

  const cards = metrics
    ? [
        { label: 'Accuracy', val: metricPercent(metrics.accuracy), color: 'text-cyber-green' },
        { label: 'Precision', val: metricPercent(metrics.precision), color: 'text-cyber-blue' },
        { label: 'Recall', val: metricPercent(metrics.recall), color: 'text-cyber-orange' },
        { label: 'F1 Score', val: metricPercent(metrics.f1_score), color: 'text-cyber-teal' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-800 pb-6 mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-cyber-blue" />
          Research Architecture & Metrics
        </h2>
        <p className="text-slate-400 mt-2 max-w-3xl">
          InternShield uses a multi-layered approach to evaluate employment fraud.
          The architecture fuses heuristic rules based on known scam patterns with
          machine learning classification to provide an explainable risk score.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 overflow-x-auto">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Network className="w-5 h-5 text-cyber-teal" />
            Detection Pipeline
          </h3>

          <div className="flex flex-col items-center space-y-4 font-mono text-sm">
            <div className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold tracking-widest text-center">
              JOB POSTING INPUT
            </div>
            <div className="h-6 w-0.5 bg-slate-600"></div>

            <div className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300">
              PREPROCESSING
            </div>
            <div className="h-6 w-0.5 bg-slate-600"></div>

            <div className="w-full text-center mb-2 text-cyber-blue font-bold text-xs uppercase tracking-widest">
              Multi-Layer Feature Extraction
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded text-center text-xs">
                <span className="text-cyber-blue block mb-1">NLP</span>
                TF-IDF
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded text-center text-xs">
                <span className="text-cyber-teal block mb-1">URL</span>
                Heuristics
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded text-center text-xs">
                <span className="text-cyber-orange block mb-1">CONTACT</span>
                Integrity
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded text-center text-xs">
                <span className="text-cyber-red block mb-1">CONTEXT</span>
                Scam Rules
              </div>
            </div>

            <div className="h-6 w-0.5 bg-slate-600"></div>
            <div className="px-6 py-3 bg-slate-800/80 border border-cyber-blue/30 rounded-lg text-cyber-blue font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              FEATURE FUSION
            </div>
            <div className="h-6 w-0.5 bg-slate-600"></div>

            <div className="flex gap-16">
              <div className="flex flex-col items-center">
                <div className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-center">
                  ML CLASSIFIER / RULE FALLBACK
                </div>
              </div>
            </div>

            <div className="h-6 w-0.5 bg-slate-600"></div>
            <div className="px-8 py-4 bg-cyber-blue/10 border-2 border-cyber-blue rounded-xl text-white font-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] text-center">
              EXPLAINABLE RISK SCORE
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyber-blue" />
              Model Evaluation
            </h3>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-slate-500">Loading metrics...</div>
            ) : metrics ? (
              <div className="space-y-6">
                {isSynthetic && (
                  <div className="p-3 rounded-lg border border-cyber-orange/40 bg-cyber-orange/10 text-cyber-orange text-xs font-mono uppercase tracking-wide">
                    Demo / Synthetic Dataset — not validated research results
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 font-mono uppercase mb-1">Model</div>
                    <div className="text-lg font-bold text-white">Logistic Regression</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 font-mono uppercase mb-1">Dataset Size</div>
                    <div className="text-lg font-bold text-white">
                      {Number.isFinite(Number(metrics.total_samples)) ? `${metrics.total_samples} samples` : 'Unavailable'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {cards.map((m) => (
                    <div
                      key={m.label}
                      className="p-4 bg-slate-900 rounded-lg border border-slate-700 flex flex-col justify-center items-center text-center relative overflow-hidden"
                    >
                      {m.val !== null && (
                        <div
                          className={`absolute bottom-0 left-0 h-1 bg-current opacity-50 ${m.color}`}
                          style={{ width: `${Math.min(100, m.val)}%` }}
                        ></div>
                      )}
                      <div className="text-xs text-slate-400 font-mono uppercase mb-2">{m.label}</div>
                      <div className={`text-3xl font-black ${m.color}`}>
                        {m.val === null ? (
                          <span className="text-lg text-slate-500">N/A</span>
                        ) : (
                          <>
                            {m.val.toFixed(1)}
                            <span className="text-lg opacity-50">%</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500 text-center px-4">
                {error || 'Metrics unavailable — run the training pipeline.'}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 bg-slate-900/80">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-blue" />
              Note on the Dataset
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prototype metrics, when shown, are computed on a synthesized training set modeled after EMSCAD-style employment scam properties.
              They must be treated as <strong className="text-slate-200">demo / synthetic results</strong>, not as validated research performance.
              A hybrid pipeline uses TF-IDF features with engineered heuristics covering NLP red flags, URL analysis, and contact mismatch indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
