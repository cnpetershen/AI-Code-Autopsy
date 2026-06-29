import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AntiAIRuntime } from '@ai-code-autopsy/core';

const DEFAULT_CODE = `export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Our Platform
        </h1>
        <p className="text-lg mb-8 text-gray-200">
          We help businesses grow with cutting-edge solutions
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg hover:-translate-y-1 transition-all">
            Get Started
          </button>
          <button className="border border-white text-white px-6 py-3 rounded-xl hover:-translate-y-1 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState<any>(null);
  const [preset, setPreset] = useState('balanced');

  const analyze = useCallback(async () => {
    const runtime = new AntiAIRuntime();
    runtime.setPreset(preset);
    const res = await runtime.scan(code);
    setResult(res);
  }, [code, preset]);

  useEffect(() => { analyze(); }, [analyze]);

  const score = result?.analysis?.score ?? 0;
  const classifications = [
    { max: 0.2, label: 'Human-Like', color: '#22c55e' },
    { max: 0.4, label: 'Mostly Human', color: '#14b8a6' },
    { max: 0.6, label: 'Hybrid', color: '#eab308' },
    { max: 0.8, label: 'Mostly AI', color: '#f97316' },
    { max: 1.0, label: 'AI Template', color: '#ef4444' },
  ];
  const cls = classifications.find(c => score < c.max) || classifications[classifications.length - 1];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 16px', background: '#1a1a1a', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong>AI Code Autopsy Playground</strong>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            style={{ background: '#333', color: '#e0e0e0', border: '1px solid #555', borderRadius: 4, padding: '4px 8px' }}>
            <option value="strict">Strict</option>
            <option value="balanced">Balanced</option>
            <option value="experimental">Experimental</option>
          </select>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          style={{
            flex: 1, background: '#1e1e1e', color: '#d4d4d4', border: 'none',
            padding: 16, fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: 13,
            resize: 'none', outline: 'none',
          }}
          spellCheck={false}
        />
      </div>

      <div style={{ width: 420, background: '#1a1a1a', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>AI Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 'bold', color: cls.color }}>
              {(score * 100).toFixed(0)}
            </span>
            <span style={{ fontSize: 14, color: '#888' }}>/100</span>
          </div>
          <div style={{
            height: 8, background: '#333', borderRadius: 4, marginTop: 8, overflow: 'hidden',
          }}>
            <div style={{ height: '100%', width: `${score * 100}%`, background: cls.color, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <div style={{ marginTop: 8, color: cls.color, fontWeight: 600, fontSize: 14 }}>
            {cls.label}
          </div>
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Category Scores</div>
          {result?.analysis?.findings && (
            <>
              <CategoryBar name="Layout" score={result.analysis.findings.filter((f: any) => f.detectorId === 'layout-detector').reduce((s: number, f: any) => s + f.score, 0) / Math.max(result.analysis.findings.filter((f: any) => f.detectorId === 'layout-detector').length, 1)} />
              <CategoryBar name="AI Patterns" score={result.analysis.findings.filter((f: any) => f.detectorId === 'ai-pattern-detector').reduce((s: number, f: any) => s + f.score, 0) / Math.max(result.analysis.findings.filter((f: any) => f.detectorId === 'ai-pattern-detector').length, 1)} />
              <CategoryBar name="Tailwind" score={result.analysis.findings.filter((f: any) => f.detectorId === 'tailwind-detector').reduce((s: number, f: any) => s + f.score, 0) / Math.max(result.analysis.findings.filter((f: any) => f.detectorId === 'tailwind-detector').length, 1)} />
              <CategoryBar name="Heuristics" score={result.analysis.findings.filter((f: any) => f.detectorId === 'heuristic-rules').reduce((s: number, f: any) => s + f.score, 0) / Math.max(result.analysis.findings.filter((f: any) => f.detectorId === 'heuristic-rules').length, 1)} />
            </>
          )}
        </div>

        <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Findings ({result?.analysis?.findings?.length || 0})</div>
          {result?.analysis?.findings?.map((f: any, i: number) => (
            <div key={i} style={{
              padding: '8px 12px', background: '#252525', borderRadius: 6, marginBottom: 8,
              borderLeft: `3px solid ${f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f97316' : f.severity === 'medium' ? '#eab308' : '#3b82f6'}`,
            }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', marginBottom: 2 }}>
                {f.severity} | {(f.score * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 13 }}>{f.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ name, score }: { name: string; score: number }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
        <span>{name}</span>
        <span>{(score * 100).toFixed(0)}%</span>
      </div>
      <div style={{ height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(score * 100, 100)}%`, background: score > 0.6 ? '#f97316' : score > 0.3 ? '#eab308' : '#22c55e', borderRadius: 2 }} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
