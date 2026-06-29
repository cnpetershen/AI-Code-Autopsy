import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';
import { formatRoastReport } from '../formatters/roast.js';

export async function roastCommand(
  filePath: string,
  options: { preset?: string; share?: boolean }
) {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    const source = await readFile(fullPath, 'utf-8');

    const runtime = new AntiAIRuntime();
    if (options.preset) {
      runtime.setPreset(options.preset);
    }

    const result = await runtime.scan(source);

    const report = formatRoastReport({
      score: result.analysis.score,
      findings: result.analysis.findings.map(f => ({
        id: f.id,
        severity: f.severity,
        message: f.message,
        explanation: f.explanation,
        score: f.score,
        tags: f.tags,
      })),
      filePath,
      elapsed: result.elapsed,
    });

    console.log(report);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
