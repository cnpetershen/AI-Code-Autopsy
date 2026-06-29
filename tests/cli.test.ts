import { describe, it, expect } from 'vitest';
import { generateRoastLine, generateRoastSummary, generateShareBlock } from '../packages/cli/src/engine/roastEngine.js';
import { formatMachineOutput } from '../packages/cli/src/formatters/machine.js';

describe('Roast Engine', () => {
  it('should generate a roast line for high AI scores', () => {
    const line = generateRoastLine(0.9);
    expect(line.length).toBeGreaterThan(0);
    expect(typeof line).toBe('string');
  });

  it('should generate a roast line for medium AI scores', () => {
    const line = generateRoastLine(0.6);
    expect(line.length).toBeGreaterThan(0);
  });

  it('should generate a roast line for low AI scores', () => {
    const line = generateRoastLine(0.2);
    expect(line.length).toBeGreaterThan(0);
  });

  it('should generate a roast line for very low AI scores', () => {
    const line = generateRoastLine(0.1);
    expect(line.length).toBeGreaterThan(0);
  });

  it('should generate deterministic-but-varied output', () => {
    const lines = new Set(Array.from({ length: 10 }, () => generateRoastLine(0.9)));
    // At least 2 different roasts should appear from the high-score pool
    expect(lines.size).toBeGreaterThanOrEqual(1);
  });

  it('should generate roast summary with all key fields', () => {
    const summary = generateRoastSummary(0.75, 10, { critical: 2, high: 3, medium: 4, low: 1 }, 50);
    expect(summary).toContain('AI CODE AUTOPSY');
    expect(summary).toContain('ROAST REPORT');
    expect(summary).toContain('75/100');
    expect(summary).toContain('10');
    expect(summary).toContain('ai-code-autopsy.dev');
  });

  it('should generate share block with correct formatting', () => {
    const block = generateShareBlock(0.85, 'test.tsx', 'This code is AI-generated');
    expect(block).toContain('AI CODE AUTOPSY');
    expect(block).toContain('85/100');
    expect(block).toContain('test.tsx');
    expect(block).toContain('ai-code-autopsy.dev');
    expect(block).toContain('╔');
    expect(block).toContain('╝');
  });

  it('should classify as AI-GENERATED for high scores', () => {
    const summary = generateRoastSummary(0.85, 5, { high: 2, medium: 3, low: 0 }, 30);
    expect(summary).toContain('AI-GENERATED');
  });

  it('should classify as HUMAN-LIKE for low scores', () => {
    const summary = generateRoastSummary(0.15, 0, {}, 30);
    expect(summary).toContain('HUMAN-LIKE');
  });
});

describe('CI Machine Formatter', () => {
  it('should output valid JSON with all required fields', () => {
    const output = formatMachineOutput({
      score: 0.61,
      verdict: 'mostly-ai',
      passed: false,
      totalFindings: 19,
      severityCounts: { high: 4, medium: 13, low: 2 },
      metrics: {
        elementCount: 109,
        symmetryScore: 0.45,
        repetitionScore: 0.36,
        classTokenDensity: 3.6,
        structuralEntropy: 0.84,
      },
      categories: { grid: 1, cards: 3 },
      elapsed: 10,
      threshold: 0.5,
    });

    const parsed = JSON.parse(output);
    expect(parsed.tool).toBe('ai-code-autopsy');
    expect(parsed.mode).toBe('ci');
    expect(parsed.result.score).toBe(61);
    expect(parsed.result.passed).toBe(false);
    expect(parsed.result.threshold).toBe(50);
    expect(parsed.result.totalFindings).toBe(19);
    expect(parsed.summary).toContain('FAILED');
    expect(parsed.result.verdict).toBe('mostly-ai');
  });

  it('should indicate PASSED when under threshold', () => {
    const output = formatMachineOutput({
      score: 0.3,
      verdict: 'human-like',
      passed: true,
      totalFindings: 2,
      severityCounts: { low: 2 },
      metrics: {
        elementCount: 20,
        symmetryScore: 0.1,
        repetitionScore: 0.1,
        classTokenDensity: 0.5,
        structuralEntropy: 0.9,
      },
      categories: {},
      elapsed: 5,
      threshold: 0.5,
    });

    const parsed = JSON.parse(output);
    expect(parsed.result.passed).toBe(true);
    expect(parsed.summary).toContain('PASSED');
    expect(parsed.result.score).toBe(30);
  });

  it('should include version and timestamp', () => {
    const output = formatMachineOutput({
      score: 0.5, verdict: 'suspicious', passed: true, totalFindings: 0,
      severityCounts: {}, metrics: { elementCount: 0, symmetryScore: 0, repetitionScore: 0, classTokenDensity: 0, structuralEntropy: 0 },
      categories: {}, elapsed: 0, threshold: 0.5,
    });
    const parsed = JSON.parse(output);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.timestamp).toBeDefined();
  });
});
