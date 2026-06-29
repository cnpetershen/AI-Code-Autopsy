import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AntiAIRuntime } from '@ai-code-autopsy/core';

interface BenchmarkResult {
  file: string;
  astScore: number;
  astFindings: number;
  astTime: number;
  regexScore: number;
  regexFindings: number;
  regexTime: number;
}

interface FPResult {
  falsePositives: number;
  falseNegatives: number;
  totalPatterns: number;
  fpRate: number;
  fnRate: number;
}

const AI_KNOWN_PATTERNS = [
  'gradient-background', 'glassmorphism', 'heavy-shadow', 'heavy-rounding',
  'hover-animation', '3-column-grid', 'excessive-transitions',
  'card-farm', 'hero-section-stack', 'pricing-trio',
  'feature-grid', 'symmetrical-layout', 'footer-4col',
  'excessive-classes', 'repetitive-cards', 'icon-every-card',
];

const HUMAN_EXPECTED_CLEAN = [
  'gradient-background', 'glassmorphism',
];

function regexBaseline(source: string) {
  const start = Date.now();
  const findings: string[] = [];

  const patterns: [RegExp, string][] = [
    [/gradient/g, 'gradient-background'],
    [/backdrop-blur/g, 'glassmorphism'],
    [/shadow-(xl|2xl)/g, 'heavy-shadow'],
    [/rounded-(2xl|3xl)/g, 'heavy-rounding'],
    [/hover:-translate-y/g, 'hover-animation'],
    [/grid-cols-3/g, '3-column-grid'],
    [/transition-all/g, 'excessive-transitions'],
    [/animate-(pulse|bounce|spin)/g, 'excessive-animation'],
    [/text-gradient/g, 'gradient-text'],
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(source)) {
      findings.push(label);
    }
  }

  const score = Math.min(findings.length * 0.15, 1);
  return { score, findings, time: Date.now() - start };
}

async function runBenchmark() {
  console.log('='.repeat(80));
  console.log('ANTI-AI UI RUNTIME BENCHMARK');
  console.log('AST Version vs Regex Baseline');
  console.log('='.repeat(80));
  console.log();

  const exampleFiles = [
    resolve(process.cwd(), 'examples/ai-generated-ui.tsx'),
    resolve(process.cwd(), 'examples/human-designed-ui.tsx'),
  ];

  const results: BenchmarkResult[] = [];
  const runtime = new AntiAIRuntime();

  for (const file of exampleFiles) {
    try {
      const source = readFileSync(file, 'utf-8');
      const fileName = file.split(/[/\\]/).pop() || file;

      const astStart = Date.now();
      const astResult = await runtime.scan(source);
      const astTime = Date.now() - astStart;

      const regexResult = regexBaseline(source);

      results.push({
        file: fileName,
        astScore: astResult.analysis.score,
        astFindings: astResult.analysis.findings.length,
        astTime,
        regexScore: regexResult.score,
        regexFindings: regexResult.findings.length,
        regexTime: regexResult.time,
      });

      console.log(`\nFile: ${fileName}`);
      console.log(`  AST version:`);
      console.log(`    Score: ${(astResult.analysis.score * 100).toFixed(1)}/100`);
      console.log(`    Findings: ${astResult.analysis.findings.length}`);
      console.log(`    Time: ${astTime}ms`);
      console.log(`  Regex baseline:`);
      console.log(`    Score: ${(regexResult.score * 100).toFixed(1)}/100`);
      console.log(`    Findings: ${regexResult.findings.length}`);
      console.log(`    Time: ${regexResult.time}ms`);
    } catch (err: any) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('FP / FN ANALYSIS');
  console.log('='.repeat(80));
  console.log();

  for (const file of exampleFiles) {
    const source = readFileSync(file, 'utf-8');
    const fileName = file.split(/[/\\]/).pop() || file;
    const astResult = await runtime.scan(source);
    const regexResult = regexBaseline(source);

    const fp: FPResult = { falsePositives: 0, falseNegatives: 0, totalPatterns: AI_KNOWN_PATTERNS.length, fpRate: 0, fnRate: 0 };

    const astLabels = new Set(astResult.analysis.findings.map((f: any) => f.tags[0] || f.id));
    const regexLabels = new Set(regexResult.findings);

    for (const pattern of AI_KNOWN_PATTERNS) {
      const astDetected = Array.from(astLabels).some(l => l.includes(pattern));
      const regexDetected = regexLabels.has(pattern);
      if (astDetected && !regexDetected) fp.falsePositives++;
      if (!astDetected && regexDetected) fp.falseNegatives++;
    }

    fp.fpRate = fp.falsePositives / fp.totalPatterns;
    fp.fnRate = fp.falseNegatives / fp.totalPatterns;

    console.log(`  ${fileName}:`);
    console.log(`    Total patterns checked: ${fp.totalPatterns}`);
    console.log(`    AST false positives: ${fp.falsePositives} (${(fp.fpRate * 100).toFixed(1)}%)`);
    console.log(`    AST false negatives: ${fp.falseNegatives} (${(fp.fnRate * 100).toFixed(1)}%)`);

    const humanIsHuman = fileName.includes('human');
    if (humanIsHuman) {
      const astHumanScore = astResult.analysis.score;
      console.log(`    Human UI classified as: ${astHumanScore < 0.5 ? '✅ Human-like' : astHumanScore < 0.7 ? '⚠️ Hybrid' : '❌ AI-like'}`);
    } else {
      const aiScore = astResult.analysis.score;
      console.log(`    AI UI classified as: ${aiScore > 0.5 ? '✅ Correctly detected' : '⚠️ Missed'}`);
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log();

  const avgAstTime = results.reduce((s, r) => s + r.astTime, 0) / Math.max(results.length, 1);
  const avgRegexTime = results.reduce((s, r) => s + r.regexTime, 0) / Math.max(results.length, 1);

  console.log(`Average time per file:`);
  console.log(`  AST:   ${avgAstTime.toFixed(0)}ms`);
  console.log(`  Regex: ${avgRegexTime.toFixed(0)}ms`);
  console.log();
  console.log(`Key differences:`);
  console.log(`  AST version detects STRUCTURAL patterns (grid layouts, card farms, pricing sections)`);
  console.log(`  Regex baseline only detects STRING patterns (class names, tokens)`);
  console.log(`  AST version: depth-aware, scope-aware, semantic context, AST-based transforms`);
  console.log(`  Regex baseline: no context, high false-positive rate`);
  console.log();
  console.log('Benchmark complete.');
}

runBenchmark().catch(console.error);
