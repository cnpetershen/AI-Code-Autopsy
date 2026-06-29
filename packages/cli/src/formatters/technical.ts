import { classifyAIScore } from '@ai-code-autopsy/core';

interface Finding {
  id: string;
  severity: string;
  message: string;
  explanation: string;
  score: number;
  tags: string[];
  location: { start: { line: number; column: number }; end: { line: number; column: number } };
}

interface Metrics {
  elementCount: number;
  uniqueTagCount: number;
  maxDepth: number;
  averageDepth: number;
  gridStructures: number;
  cardLikeElements: number;
  symmetryScore: number;
  repetitionScore: number;
  classTokenDensity: number;
  structuralEntropy: number;
}

interface ExplainReportData {
  score: number;
  findings: Finding[];
  metrics: Metrics;
  filePath: string;
  elapsed: number;
  explanations: Array<{ category: string; message: string; impact: number; suggestion: string }>;
}

export function formatTechnicalReport(data: ExplainReportData): string {
  const classification = classifyAIScore(data.score);

  const lines: string[] = [];
  lines.push('');
  lines.push('  ╔══════════════════════════════════════════════════════════╗');
  lines.push('  ║        AI CODE AUTOPSY — TECHNICAL ANALYSIS            ║');
  lines.push('  ╚══════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  File:     ${data.filePath}`);
  lines.push(`  Score:    ${(data.score * 100).toFixed(0)}/100 (${classification.label})`);
  lines.push(`  Elapsed:  ${data.elapsed}ms`);
  lines.push('');
  lines.push('  ── METRICS BREAKDOWN ──');
  lines.push('');
  lines.push(`  Elements:              ${data.metrics.elementCount}`);
  lines.push(`  Unique HTML tags:      ${data.metrics.uniqueTagCount}`);
  lines.push(`  Max nesting depth:     ${data.metrics.maxDepth}`);
  lines.push(`  Average depth:         ${data.metrics.averageDepth.toFixed(1)}`);
  lines.push(`  Grid structures:       ${data.metrics.gridStructures}`);
  lines.push(`  Card-like elements:    ${data.metrics.cardLikeElements}`);
  lines.push('');
  lines.push('  ── AI SIGNATURE INDICATORS ──');
  lines.push('');
  lines.push(`  Symmetry score:        ${(data.metrics.symmetryScore * 100).toFixed(0)}%`);
  lines.push(`  Repetition score:      ${(data.metrics.repetitionScore * 100).toFixed(0)}%`);
  lines.push(`  Class token density:   ${data.metrics.classTokenDensity.toFixed(1)}/element`);
  lines.push(`  Structural entropy:    ${data.metrics.structuralEntropy.toFixed(2)}`);
  lines.push('');
  lines.push('  ── DETECTED PATTERNS ──');
  lines.push('');

  if (data.findings.length === 0) {
    lines.push('  No AI patterns detected.');
  } else {
    for (const f of data.findings) {
      const loc = `[L${f.location.start.line}:${f.location.start.column}]`;
      lines.push(`  ${loc} [${f.severity.toUpperCase()}] (score: ${(f.score * 100).toFixed(0)})`);
      lines.push(`       ${f.message}`);
      lines.push(`       tags: ${f.tags.join(', ')}`);
      lines.push('');
    }
  }

  lines.push('  ── EXPLANATIONS & SUGGESTIONS ──');
  lines.push('');

  for (const exp of data.explanations) {
    lines.push(`  ▶ [${exp.category}] ${exp.message}`);
    lines.push(`    → ${exp.suggestion}`);
    lines.push('');
  }

  return lines.join('\n');
}
