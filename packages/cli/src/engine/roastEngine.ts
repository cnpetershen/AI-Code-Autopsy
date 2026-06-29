interface RoastLine {
  condition: (score: number, severity: string, category: string) => boolean;
  lines: string[];
}

const ROAST_LINES: RoastLine[] = [
  {
    condition: (score) => score >= 0.85,
    lines: [
      "This code is more AI than human. Did you even look at it?",
      "Beep boop. Your UI is giving 'I am a template' vibes.",
      "This file was definitely written by ChatGPT after 3 coffees on a Monday.",
      "Congratulations, you built the most generic page in existence.",
      "Your AI thinks it is a designer. It is not.",
      "This code has AI written all over it. Literally.",
      "If cliché was a programming language, this would be it.",
      "I have seen better structure in a IKEA manual.",
    ],
  },
  {
    condition: (score) => score >= 0.7 && score < 0.85,
    lines: [
      "Your code has AI fingerprints. And not the cool kind.",
      "Half your page is copy-pasted from a template. The other half is worse.",
      "This is what happens when you let AI cook.",
      "Your AI assistant was feeling particularly uninspired today.",
      "Someone asked AI to build a landing page. That someone was you.",
      "This code screams 'ship fast, think never'.",
      "The AI was not the problem. You were the problem.",
    ],
  },
  {
    condition: (score) => score >= 0.5 && score < 0.7,
    lines: [
      "50 shades of AI-generated.",
      "Your code has some explaining to do.",
      "Not bad, but your AI is showing.",
      "This code went to the AI template party. It stayed too long.",
      "You are 60% AI, 40% trying.",
    ],
  },
  {
    condition: (score) => score < 0.5,
    lines: [
      "Surprisingly human. I am impressed. Or concerned.",
      "Who knew a human could write code this clean?",
      "No AI detected. You have been doing this a while.",
      "Your code passes the vibe check.",
      "This is artisan code. Hand-crafted, not machine-generated.",
      "You are the 1% who actually thinks before typing.",
    ],
  },
];

const SEVERITY_ROASTS: Record<string, string[]> = {
  critical: [
    "Critical finding. Your AI-generated blunder is showing.",
    "This is not a bug. This is a cry for help.",
  ],
  high: [
    "High severity. Your code quality is in critical condition.",
    "High priority issue. Fix this before your users notice.",
  ],
  medium: [
    "Medium. Not terrible, but also not great.",
    "Medium severity. The AI was trying, bless its heart.",
  ],
  low: [
    "Low severity. But still, you can do better.",
    "Low priority. We will ignore this if you do.",
  ],
};

function pickLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function generateRoastLine(score: number): string {
  const matched = ROAST_LINES.find((r) => r.condition(score, '', ''));
  return matched ? pickLine(matched.lines) : ROAST_LINES[ROAST_LINES.length - 1].lines[0];
}

export function generateRoastSummary(
  score: number,
  findingCount: number,
  severityCounts: Record<string, number>,
  elapsed: number
): string {
  const roastLine = generateRoastLine(score);
  const verdict = score >= 0.7 ? 'AI-GENERATED' : score >= 0.5 ? 'SUSPICIOUS' : 'HUMAN-LIKE';
  const sentiment = score >= 0.7 ? '😬' : score >= 0.5 ? '🤔' : '✅';

  const lines: string[] = [];
  lines.push('');
  lines.push(`  ${sentiment}  AI CODE AUTOPSY - ROAST REPORT`);
  lines.push('  ──────────────────────────────────────────────');
  lines.push('');
  lines.push(`  " ${roastLine} "`);
  lines.push('');
  lines.push(`  AI Score:      ${(score * 100).toFixed(0)}/100`);
  lines.push(`  Verdict:       ${verdict}`);
  lines.push(`  Findings:      ${findingCount}`);
  if (severityCounts.critical) lines.push(`  Critical:      ${severityCounts.critical}`);
  if (severityCounts.high) lines.push(`  High:          ${severityCounts.high}`);
  if (severityCounts.medium) lines.push(`  Medium:        ${severityCounts.medium}`);
  if (severityCounts.low) lines.push(`  Low:           ${severityCounts.low}`);
  lines.push(`  Time:          ${elapsed}ms`);
  lines.push('');
  lines.push(`  ──────────────────────────────────────────────`);
  lines.push(`  Share this roast: https://ai-code-autopsy.dev`);
  lines.push('');

  return lines.join('\n');
}

export function generateShareBlock(score: number, filePath: string, roastLine: string): string {
  const lines: string[] = [];
  lines.push('╔══════════════════════════════════════════════╗');
  lines.push('║     🔍 AI CODE AUTOPSY - AUTOPSY RESULT     ║');
  lines.push('╠══════════════════════════════════════════════╣');
  lines.push(`║  File: ${filePath.padEnd(38)}║`);
  lines.push(`║  Score: ${(score * 100).toFixed(0)}/100${' '.repeat(31)}║`);
  lines.push('╠══════════════════════════════════════════════╣');
  lines.push(`║  ${roastLine.padEnd(44)}║`);
  lines.push('╠══════════════════════════════════════════════╣');
  lines.push('║  🔗 https://ai-code-autopsy.dev              ║');
  lines.push('╚══════════════════════════════════════════════╝');
  return lines.join('\n');
}
