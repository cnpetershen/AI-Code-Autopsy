import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';
import { formatMachineOutput } from '../formatters/machine.js';

const DEFAULT_THRESHOLD = 0.5;

export async function ciCommand(
  filePath: string,
  options: { threshold?: string; failOn?: string }
) {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    const source = await readFile(fullPath, 'utf-8');

    const runtime = new AntiAIRuntime();
    const result = await runtime.scan(source);

    const threshold = options.threshold ? parseFloat(options.threshold) : DEFAULT_THRESHOLD;
    const passed = result.analysis.score <= threshold;

    const severityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const f of result.analysis.findings) {
      severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
      for (const tag of f.tags) {
        categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
      }
    }

    const verdict = result.analysis.score >= 0.85 ? 'ai-generated' :
      result.analysis.score >= 0.6 ? 'mostly-ai' :
      result.analysis.score >= 0.4 ? 'suspicious' :
      result.analysis.score >= 0.2 ? 'mostly-human' : 'human-like';

    const machineOutput = formatMachineOutput({
      score: result.analysis.score,
      verdict,
      passed,
      totalFindings: result.analysis.findings.length,
      severityCounts,
      metrics: {
        elementCount: result.analysis.metrics.elementCount,
        symmetryScore: result.analysis.metrics.symmetryScore,
        repetitionScore: result.analysis.metrics.repetitionScore,
        classTokenDensity: result.analysis.metrics.classTokenDensity,
        structuralEntropy: result.analysis.metrics.structuralEntropy,
      },
      categories: categoryCounts,
      elapsed: result.elapsed,
      threshold,
    });

    console.log(machineOutput);

    if (!passed) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error(JSON.stringify({
      tool: 'ai-code-autopsy',
      version: '1.0.0',
      mode: 'ci',
      error: true,
      message: err.message,
    }));
    process.exit(1);
  }
}
