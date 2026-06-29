import { generateRoastSummary, generateShareBlock, generateRoastLine } from '../engine/roastEngine.js';

interface Finding {
  id: string;
  severity: string;
  message: string;
  explanation: string;
  score: number;
  tags: string[];
}

interface RoastReportData {
  score: number;
  findings: Finding[];
  filePath: string;
  elapsed: number;
}

export function formatRoastReport(data: RoastReportData): string {
  const severityCounts: Record<string, number> = {};
  for (const f of data.findings) {
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
  }

  const summary = generateRoastSummary(
    data.score,
    data.findings.length,
    severityCounts,
    data.elapsed
  );

  const roastLine = generateRoastLine(data.score);
  const shareBlock = generateShareBlock(data.score, data.filePath, roastLine);

  const lines: string[] = [];
  lines.push(summary);
  lines.push('');
  lines.push('  🔥 TOP FINDINGS (the juicy ones):');
  lines.push('');

  const sortedFindings = [...data.findings].sort(
    (a, b) => b.score - a.score
  );

  for (const f of sortedFindings.slice(0, 5)) {
    const severityIcon = f.severity === 'critical' ? '💀' :
      f.severity === 'high' ? '🔥' :
      f.severity === 'medium' ? '⚠️' : '📝';
    lines.push(`  ${severityIcon}  ${f.message}`);
    lines.push(`     ${f.explanation}`);
    lines.push('');
  }

  lines.push('  ──────────────────────────────────────────────');
  lines.push('  📸  SCREENSHOT THIS! Share your roast:');
  lines.push('');
  lines.push(shareBlock);
  lines.push('');

  return lines.join('\n');
}
