import { Finding, ExplainEntry, AnalysisResult } from '../ast/types';
import { ScoreResult, classifyAIScore } from './score';
import { UIMetrics } from '../ast/types';

export function generateExplanations(
  findings: Finding[],
  scoreResult: ScoreResult,
  metrics: UIMetrics
): ExplainEntry[] {
  const entries: ExplainEntry[] = [];

  const classification = classifyAIScore(scoreResult.totalScore);
  entries.push({
    category: 'overall',
    message: `UI Style Score: ${(scoreResult.totalScore * 100).toFixed(0)}/100 — ${classification.label}`,
    impact: scoreResult.totalScore,
    suggestion: classification.description,
  });

  const findingsByCategory = groupFindingsByCategory(findings);
  for (const [category, catFindings] of findingsByCategory) {
    const avgScore = catFindings.reduce((s, f) => s + f.score, 0) / catFindings.length;
    const topFindings = catFindings.slice(0, 2);

    for (const f of topFindings) {
      entries.push({
        category,
        message: f.message,
        impact: f.score,
        suggestion: f.explanation,
      });
    }
  }

  if (metrics.symmetryScore > 0.5) {
    entries.push({
      category: 'structural',
      message: `High symmetry score (${(metrics.symmetryScore * 100).toFixed(0)}%)`,
      impact: metrics.symmetryScore,
      suggestion: 'Consider breaking symmetry by using asymmetric layouts, varied column spans, or offset positioning.',
    });
  }

  if (metrics.repetitionScore > 0.5) {
    entries.push({
      category: 'structural',
      message: `High repetition score (${(metrics.repetitionScore * 100).toFixed(0)}%)`,
      impact: metrics.repetitionScore,
      suggestion: 'Reduce template repetition by varying card styles, mixing content types, and alternating layouts.',
    });
  }

  if (metrics.classTokenDensity > 6) {
    entries.push({
      category: 'styling',
      message: `High Tailwind class density (avg ${metrics.classTokenDensity.toFixed(1)} classes/element)`,
      impact: Math.min(metrics.classTokenDensity / 12, 1),
      suggestion: 'Extract repeated class combinations into reusable components or use @apply directives.',
    });
  }

  if (metrics.structuralEntropy < 0.4) {
    entries.push({
      category: 'structural',
      message: `Low structural diversity (entropy: ${metrics.structuralEntropy.toFixed(2)})`,
      impact: 1 - metrics.structuralEntropy,
      suggestion: 'Use a wider variety of HTML elements and layout patterns. Mix sections, articles, asides, and semantic elements.',
    });
  }

  entries.sort((a, b) => b.impact - a.impact);
  return entries;
}

function groupFindingsByCategory(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>();
  for (const f of findings) {
    const category = f.tags[0] || 'uncategorized';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(f);
  }
  return groups;
}

export function formatExplainSummary(
  findings: Finding[],
  explanations: ExplainEntry[],
  metrics: UIMetrics
): string {
  const lines: string[] = [];
  lines.push('='.repeat(60));
  lines.push('AI UI STYLE ANALYSIS REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  lines.push(`Elements Analyzed: ${metrics.elementCount}`);
  lines.push(`Maximum Nesting: ${metrics.maxDepth} levels`);
  lines.push(`Grid Structures: ${metrics.gridStructures}`);
  lines.push(`Card-like Elements: ${metrics.cardLikeElements}`);
  lines.push('');

  lines.push('Findings:');
  for (const f of findings) {
    const severityIcon = f.severity === 'critical' ? '🔴' :
      f.severity === 'high' ? '🟠' :
      f.severity === 'medium' ? '🟡' : '🔵';
    lines.push(`  ${severityIcon} [${f.severity.toUpperCase()}] ${f.message}`);
    lines.push(`     ${f.explanation}`);
  }
  lines.push('');

  lines.push('Suggestions:');
  for (const exp of explanations.slice(0, 5)) {
    lines.push(`  • ${exp.message}`);
    lines.push(`    ${exp.suggestion}`);
  }
  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
}
