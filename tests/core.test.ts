import { describe, it, expect } from 'vitest';
import { AntiAIRuntime, parseUI, computeMetrics, computeScore } from '../packages/core/src/index.js';

const AI_CODE = `export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-lg mb-8 text-gray-200">Description here</p>
        <div className="flex justify-center gap-4">
          <button className="bg-white px-6 py-3 rounded-xl shadow-lg hover:-translate-y-1 transition-all">
            Start
          </button>
          <button className="border px-6 py-3 rounded-xl">Learn</button>
        </div>
      </div>
    </section>
  );
}`;

const HUMAN_CODE = `export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="w-64 border-r p-4">
        <nav>
          {items.map(i => <a key={i} className="flex gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">{i}</a>)}
        </nav>
      </aside>
      <main className="ml-64 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">New</button>
        </header>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="col-span-2 bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Revenue</div>
            <div className="text-3xl font-bold">$84K</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-bold">2.8K</div>
          </div>
        </div>
      </main>
    </div>
  );
}`;

describe('AntiAIUI Runtime', () => {
  it('should parse JSX without errors', () => {
    const result = parseUI(AI_CODE);
    expect(result.errors.length).toBe(0);
    expect(result.elements.length).toBeGreaterThan(0);
  });

  it('should detect AI patterns in AI-generated code', async () => {
    const runtime = new AntiAIRuntime();
    const result = await runtime.scan(AI_CODE);
    expect(result.analysis.score).toBeGreaterThan(0.1);
    expect(result.analysis.findings.length).toBeGreaterThan(0);
  });

  it('should give lower score to human-designed code', async () => {
    const runtime = new AntiAIRuntime();
    const result = await runtime.scan(HUMAN_CODE);
    expect(result.analysis.score).toBeLessThan(0.8);
  });

  it('should compute metrics correctly', () => {
    const parsed = parseUI(AI_CODE);
    const metrics = computeMetrics(parsed.elements);
    expect(metrics.elementCount).toBeGreaterThan(0);
    expect(metrics.maxDepth).toBeGreaterThan(0);
    expect(metrics.uniqueTagCount).toBeGreaterThan(0);
  });

  it('should produce explanations for AI code', async () => {
    const runtime = new AntiAIRuntime();
    const result = await runtime.explain(AI_CODE);
    expect(result.analysis.explanations.length).toBeGreaterThan(0);
    expect(result.summary.length).toBeGreaterThan(100);
  });

  it('should transform code with auto-fix', async () => {
    const runtime = new AntiAIRuntime();
    runtime.setPreset('strict');
    const result = await runtime.fix(AI_CODE);
    if (result.transform) {
      expect(result.transform.changes.length).toBeGreaterThan(0);
    }
  });

  it('should handle non-JSX gracefully', async () => {
    const runtime = new AntiAIRuntime();
    const result = await runtime.scan('const x = 1;');
    expect(result.analysis.score).toBeLessThan(0.3);
  });

  it('should classify scores correctly', async () => {
    const runtime = new AntiAIRuntime();
    const aiResult = await runtime.scan(AI_CODE);
    const humanResult = await runtime.scan(HUMAN_CODE);
    expect(aiResult.analysis.score).toBeGreaterThan(humanResult.analysis.score);
  });

  it('should support different presets', async () => {
    const runtime = new AntiAIRuntime();
    runtime.setPreset('strict');
    const strictResult = await runtime.scan(AI_CODE);

    runtime.setPreset('experimental');
    const expResult = await runtime.scan(AI_CODE);

    // Strict should give equal or higher scores
    expect(strictResult.analysis.findings.length).toBeGreaterThanOrEqual(
      expResult.analysis.findings.length
    );
  });
});
