import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';
import { formatForensicReport } from '../formatters/forensic.js';

export async function scanCommand(
  filePath: string,
  options: { json?: boolean; preset?: string }
) {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    const source = await readFile(fullPath, 'utf-8');

    const runtime = new AntiAIRuntime();
    if (options.preset) {
      runtime.setPreset(options.preset);
    }

    const result = await runtime.scan(source);

    if (options.json) {
      console.log(JSON.stringify({
        score: result.analysis.score,
        verdict: result.analysis.score >= 0.7 ? 'ai-generated' :
          result.analysis.score >= 0.4 ? 'suspicious' : 'human-like',
        classification: result.analysis.summary.split('\n')[1]?.trim() || '',
        findings: result.analysis.findings.map(f => ({
          id: f.id,
          severity: f.severity,
          message: f.message,
          explanation: f.explanation,
          score: f.score,
          tags: f.tags,
          location: f.location,
        })),
        metrics: result.analysis.metrics,
        explanations: result.analysis.explanations.slice(0, 10),
        elapsed: result.elapsed,
      }, null, 2));
      return;
    }

    const report = formatForensicReport({
      score: result.analysis.score,
      findings: result.analysis.findings.map(f => ({
        id: f.id,
        severity: f.severity,
        message: f.message,
        explanation: f.explanation,
        score: f.score,
        tags: f.tags,
      })),
      metrics: {
        elementCount: result.analysis.metrics.elementCount,
        uniqueTagCount: result.analysis.metrics.uniqueTagCount,
        maxDepth: result.analysis.metrics.maxDepth,
        gridStructures: result.analysis.metrics.gridStructures,
        cardLikeElements: result.analysis.metrics.cardLikeElements,
        symmetryScore: result.analysis.metrics.symmetryScore,
        repetitionScore: result.analysis.metrics.repetitionScore,
        classTokenDensity: result.analysis.metrics.classTokenDensity,
        structuralEntropy: result.analysis.metrics.structuralEntropy,
      },
      filePath,
      elapsed: result.elapsed,
      explanations: result.analysis.explanations,
    });

    console.log(report);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
