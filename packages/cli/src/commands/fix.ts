import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';

export async function fixCommand(
  filePath: string,
  options: { json?: boolean; preset?: string; output?: string; dryRun?: boolean }
) {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    const source = await readFile(fullPath, 'utf-8');

    const runtime = new AntiAIRuntime();
    if (options.preset) {
      runtime.setPreset(options.preset);
    }

    const result = await runtime.fix(source);

    if (options.json) {
      console.log(JSON.stringify({
        score: result.analysis.score,
        findings: result.analysis.findings.length,
        transformApplied: result.transform?.success || false,
        changes: result.transform?.changes || [],
        guardrailViolations: result.transform?.guardrailViolations || [],
        elapsed: result.elapsed,
      }, null, 2));
      return;
    }

    console.log(`Score: ${(result.analysis.score * 100).toFixed(0)}/100`);

    if (result.transform?.success) {
      if (options.dryRun) {
        console.log('\nWould apply these changes:');
        for (const change of result.transform.changes) {
          console.log(`  ${change}`);
        }
      } else {
        const outputPath = options.output
          ? resolve(process.cwd(), options.output)
          : fullPath;

        await writeFile(outputPath, result.transform.code, 'utf-8');
        console.log(`\nFixed code written to: ${outputPath}`);
        console.log(`Changes applied: ${result.transform.changes.length}`);

        if (result.transform.guardrailViolations.length > 0) {
          console.log('\n⚠️  Guardrail violations:');
          for (const v of result.transform.guardrailViolations) {
            console.log(`  ${v}`);
          }
        }
      }
    } else {
      console.log('No transformations needed or score too low for auto-fix.');
    }

    console.log(`\nCompleted in ${result.elapsed}ms`);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
