import { JSXElementInfo, Finding, TransformResult } from '../ast/types.js';

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  check: (original: string, transformed: string, findings: Finding[]) => string[];
}

const guardrailRules: GuardrailRule[] = [
  {
    id: 'no-layout-break',
    name: 'Prevent layout breaking changes',
    description: 'Ensures critical layout classes are not removed',
    check: (original, transformed, findings) => {
      const violations: string[] = [];
      const criticalClasses = ['flex', 'grid', 'block', 'relative', 'absolute', 'overflow-hidden'];

      for (const cls of criticalClasses) {
        const origCount = (original.match(new RegExp(cls, 'g')) || []).length;
        const newCount = (transformed.match(new RegExp(cls, 'g')) || []).length;
        if (origCount > 0 && newCount === 0) {
          violations.push(`Critical layout class "${cls}" was completely removed`);
        }
      }
      return violations;
    },
  },
  {
    id: 'no-empty-elements',
    name: 'Prevent empty elements',
    description: 'Ensures transformations do not create empty elements',
    check: (original, transformed, findings) => {
      const violations: string[] = [];
      const emptyDivPattern = /<div[^>]*>\s*<\/div>/g;
      const emptyElements = transformed.match(emptyDivPattern);
      if (emptyElements && emptyElements.length > 2) {
        violations.push(`Transform created ${emptyElements.length} empty div elements`);
      }
      return violations;
    },
  },
  {
    id: 'no-react-key-loss',
    name: 'Preserve React keys',
    description: 'Ensures key props are not removed during transformation',
    check: (original, transformed, findings) => {
      const violations: string[] = [];
      const origKeys = original.match(/key=["'][^"']*["']/g);
      const newKeys = transformed.match(/key=["'][^"']*["']/g);
      if (origKeys && !newKeys) {
        violations.push('React keys were lost during transformation');
      }
      return violations;
    },
  },
  {
    id: 'preserve-conditional-rendering',
    name: 'Preserve conditional rendering',
    description: 'Ensures ternary/&& expressions are not corrupted',
    check: (original, transformed, findings) => {
      const violations: string[] = [];
      const ternaryPattern = /\{[^}]+\?[^:]+:[^}]+\}/g;
      const origTernaries = original.match(ternaryPattern);
      const newTernaries = transformed.match(ternaryPattern);
      if (origTernaries && (!newTernaries || origTernaries.length !== newTernaries.length)) {
        violations.push('Conditional rendering expressions may have been corrupted');
      }
      return violations;
    },
  },
];

export function applyGuardrails(original: string, transformed: string, findings: Finding[]): string[] {
  const allViolations: string[] = [];
  for (const rule of guardrailRules) {
    const violations = rule.check(original, transformed, findings);
    allViolations.push(...violations);
  }
  return allViolations;
}

export function hasCriticalViolations(violations: string[]): boolean {
  return violations.length > 0;
}
