import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';
import { formatTechnicalReport } from '../formatters/technical.js';

export async function explainCommand(
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

    const result = await runtime.explain(source);

    if (options.json) {
      console.log(JSON.stringify({
        score: result.analysis.score,
        elapsed: result.elapsed,
        explanations: result.analysis.explanations,
        metrics: result.analysis.metrics,
        findings: result.analysis.findings.map(f => ({
          id: f.id,
          severity: f.severity,
          message: f.message,
          explanation: f.explanation,
          score: f.score,
          tags: f.tags,
          location: f.location,
        })),
      }, null, 2));
      return;
    }

    const report = formatTechnicalReport({
      score: result.analysis.score,
      findings: result.analysis.findings.map(f => ({
        id: f.id,
        severity: f.severity,
        message: f.message,
        explanation: f.explanation,
        score: f.score,
        tags: f.tags,
        location: f.location,
      })),
      metrics: {
        elementCount: result.analysis.metrics.elementCount,
        uniqueTagCount: result.analysis.metrics.uniqueTagCount,
        maxDepth: result.analysis.metrics.maxDepth,
        averageDepth: result.analysis.metrics.averageDepth,
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
