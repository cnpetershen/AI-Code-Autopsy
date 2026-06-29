import { classifyAIScore } from '@ai-code-autopsy/core';
import { generateRoastLine } from '../engine/roastEngine.js';

interface Finding {
  id: string;
  severity: string;
  message: string;
  explanation: string;
  score: number;
  tags: string[];
}

interface Metrics {
  elementCount: number;
  uniqueTagCount: number;
  maxDepth: number;
  gridStructures: number;
  cardLikeElements: number;
  symmetryScore: number;
  repetitionScore: number;
  classTokenDensity: number;
  structuralEntropy: number;
}

interface ForensicReportData {
  score: number;
  findings: Finding[];
  metrics: Metrics;
  filePath: string;
  elapsed: number;
  explanations: Array<{ category: string; message: string; impact: number; suggestion: string }>;
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: '🔴 CRITICAL',
  high: '🟠 HIGH',
  medium: '🟡 MEDIUM',
  low: '🔵 LOW',
};

export function formatForensicReport(data: ForensicReportData): string {
  const classification = classifyAIScore(data.score);
  const roastLine = generateRoastLine(data.score);
  const severityCounts: Record<string, number> = {};
  for (const f of data.findings) {
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
  }

  const lines: string[] = [];
  lines.push('');
  lines.push('  ╔══════════════════════════════════════════════════════════╗');
  lines.push('  ║           AI CODE AUTOPSY — FORENSIC REPORT            ║');
  lines.push('  ╚══════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  Target:       ${data.filePath}`);
  lines.push(`  Elapsed:      ${data.elapsed}ms`);
  lines.push('');
  lines.push('  ┌────────────────────────────────────────────────────────┐');
  lines.push('  │                  EXECUTIVE SUMMARY                     │');
  lines.push('  └────────────────────────────────────────────────────────┘');
  lines.push('');
  lines.push(`    AI Score:      ${(data.score * 100).toFixed(0)}/100`);
  lines.push(`    Classification: ${classification.label}`);
  lines.push(`    Verdict:       ${classification.description}`);
  lines.push('');
  lines.push(`    ❝ ${roastLine} ❞`);
  lines.push('');
  lines.push('  ┌────────────────────────────────────────────────────────┐');
  lines.push('  │                  STRUCTURAL METRICS                    │');
  lines.push('  └────────────────────────────────────────────────────────┘');
  lines.push('');
  lines.push(`    Elements:        ${data.metrics.elementCount}`);
  lines.push(`    Unique Tags:     ${data.metrics.uniqueTagCount}`);
  lines.push(`    Max Nesting:     ${data.metrics.maxDepth} levels`);
  lines.push(`    Grid Structures: ${data.metrics.gridStructures}`);
  lines.push(`    Card Elements:   ${data.metrics.cardLikeElements}`);
  lines.push(`    Symmetry:        ${(data.metrics.symmetryScore * 100).toFixed(0)}%`);
  lines.push(`    Repetition:      ${(data.metrics.repetitionScore * 100).toFixed(0)}%`);
  lines.push(`    Class Density:   ${data.metrics.classTokenDensity.toFixed(1)} avg/element`);
  lines.push(`    Diversity:       ${(data.metrics.structuralEntropy * 100).toFixed(0)}%`);
  lines.push('');
  lines.push('  ┌────────────────────────────────────────────────────────┐');
  lines.push('  │                    FINDINGS                            │');
  lines.push('  └────────────────────────────────────────────────────────┘');
  lines.push('');

  if (data.findings.length === 0) {
    lines.push('    No findings. This code is clean.');
  } else {
    for (const f of data.findings) {
      const badge = SEVERITY_BADGE[f.severity] || f.severity.toUpperCase();
      lines.push(`    ${badge}  ${f.message}`);
      lines.push(`           ${f.explanation}`);
      lines.push('');
    }
  }

  lines.push('  ┌────────────────────────────────────────────────────────┐');
  lines.push('  │                  RECOMMENDATIONS                       │');
  lines.push('  └────────────────────────────────────────────────────────┘');
  lines.push('');

  const topExplanations = data.explanations.slice(0, 4);
  for (const exp of topExplanations) {
    lines.push(`    ▶ ${exp.message}`);
    lines.push(`      ${exp.suggestion}`);
    lines.push('');
  }

  lines.push('  ──────────────────────────────────────────────────────────');
  lines.push('  Run `npx ai-code-autopsy roast <file>` for a more entertaining take.');
  lines.push('  Run `npx ai-code-autopsy explain <file>` for detailed technical analysis.');
  lines.push('');
  if (data.score >= 0.5) {
    lines.push(`  ⚠️  CI check would FAIL (threshold: 50/100, got ${(data.score * 100).toFixed(0)}/100)`);
  } else {
    lines.push(`  ✅ CI check would PASS (threshold: 50/100, got ${(data.score * 100).toFixed(0)}/100)`);
  }
  lines.push('');

  return lines.join('\n');
}
