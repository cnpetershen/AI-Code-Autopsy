interface MachineOutput {
  score: number;
  verdict: string;
  passed: boolean;
  totalFindings: number;
  severityCounts: Record<string, number>;
  metrics: {
    elementCount: number;
    symmetryScore: number;
    repetitionScore: number;
    classTokenDensity: number;
    structuralEntropy: number;
  };
  categories: Record<string, number>;
  elapsed: number;
  threshold: number;
}

export function formatMachineOutput(data: MachineOutput): string {
  const output = {
    tool: 'ai-code-autopsy',
    version: '1.0.0',
    mode: 'ci',
    timestamp: new Date().toISOString(),
    result: {
      score: Math.round(data.score * 100),
      verdict: data.verdict,
      passed: data.passed,
      totalFindings: data.totalFindings,
      severityBreakdown: data.severityCounts,
      metrics: data.metrics,
      categoryBreakdown: data.categories,
      elapsedMs: data.elapsed,
      threshold: Math.round(data.threshold * 100),
    },
    summary: data.passed
      ? `PASSED: AI score ${Math.round(data.score * 100)}/100 (threshold: ${Math.round(data.threshold * 100)}/100)`
      : `FAILED: AI score ${Math.round(data.score * 100)}/100 exceeds threshold ${Math.round(data.threshold * 100)}/100`,
  };

  return JSON.stringify(output, null, 2);
}
