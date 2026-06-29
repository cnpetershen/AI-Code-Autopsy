import { JSXElementInfo, Finding, DetectorResult } from '../ast/types';
import { tokenizeTailwind } from '../utils/tailwindTokens';

export { tokenizeTailwind } from '../utils/tailwindTokens';
export { classifyClassTokenDensity } from '../utils/tailwindTokens';

const AI_TOKEN_SIGNATURES: { pattern: RegExp; category: string; weight: number }[] = [
  { pattern: /backdrop-blur/, category: 'glassmorphism', weight: 0.9 },
  { pattern: /bg-gradient-to-[brtrbl]/, category: 'gradient', weight: 0.7 },
  { pattern: /shadow-(xl|2xl)/, category: 'heavy-shadow', weight: 0.6 },
  { pattern: /rounded-(2xl|3xl)/, category: 'heavy-rounding', weight: 0.5 },
  { pattern: /hover:-translate-y/, category: 'hover-animation', weight: 0.5 },
  { pattern: /transition-all/, category: 'excessive-transition', weight: 0.4 },
  { pattern: /duration-\d+/, category: 'animation-timing', weight: 0.3 },
  { pattern: /backdrop-filter/, category: 'glassmorphism', weight: 0.8 },
  { pattern: /bg-opacity-\d+/, category: 'semi-transparent', weight: 0.4 },
  { pattern: /text-gradient/, category: 'gradient-text', weight: 0.6 },
  { pattern: /animate-(pulse|bounce|spin)/, category: 'excessive-animation', weight: 0.5 },
];

const NON_AI_TOKENS = new Set([
  'text-sm', 'text-base', 'text-lg', 'text-xl',
  'font-medium', 'font-semibold', 'font-bold',
  'border', 'border-b', 'border-t', 'border-l', 'border-r',
  'flex', 'flex-col', 'flex-row', 'flex-wrap',
  'items-start', 'items-end', 'justify-start', 'justify-end',
  'w-full', 'h-full', 'w-auto', 'h-auto',
  'relative', 'absolute', 'fixed', 'sticky',
  'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
  'overflow-hidden', 'overflow-auto', 'truncate',
  'whitespace-nowrap', 'break-words',
  'cursor-pointer', 'select-none', 'pointer-events-none',
  'opacity-0', 'opacity-50', 'opacity-100',
  'hidden', 'block', 'inline-block', 'inline-flex',
  'sr-only', 'not-sr-only',
  'resize-none', 'appearance-none',
  'outline-none', 'ring-0', 'focus:ring-2',
  'focus:outline-none', 'focus:border-blue-500',
  'disabled:opacity-50', 'disabled:cursor-not-allowed',
]);

export function detectAIClassPatterns(elements: JSXElementInfo[]): DetectorResult {
  const findings: Finding[] = [];

  for (const el of elements) {
    if (!el.className) continue;

    const tokens = tokenizeTailwind(el.className);
    for (const sig of AI_TOKEN_SIGNATURES) {
      const matches = tokens.filter(t => sig.pattern.test(t.raw));
      if (matches.length > 0) {
        findings.push({
          id: `ai-token-${sig.category}-${el.tagName}-${el.depth}`,
          detectorId: 'tailwind-detector',
          severity: 'medium',
          message: `AI-styling token detected: ${sig.category}`,
          explanation: `"${matches[0].raw}" is a common AI design pattern. Real products use ${sig.category} sparingly.`,
          location: {
            start: { line: 0, column: 0 },
            end: { line: 0, column: 0 },
          },
          element: el,
          score: sig.weight,
          tags: ['tailwind', 'styling', sig.category],
        });
      }
    }
  }

  return {
    detectorId: 'tailwind-detector',
    findings,
  };
}
