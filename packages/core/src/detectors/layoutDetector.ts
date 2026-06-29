import { JSXElementInfo, Finding, DetectorResult, ASTQuery } from '../ast/types';

interface LayoutPattern {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  tags: string[];
  check: (elements: JSXElementInfo[]) => Finding[];
}

const GRID_CLASS_PATTERNS = [
  /grid-cols-\d+/,
  /grid-rows-\d+/,
  /lg:grid-cols-\d+/,
  /md:grid-cols-\d+/,
];

const CARD_CLASS_PATTERNS = [
  /rounded-(xl|2xl|3xl)/,
  /shadow-(md|lg|xl|2xl)/,
  /p-\d+/,
  /bg-white/,
  /dark:bg-gray-800/,
];

const SYMMETRY_PATTERNS = [
  /text-center/,
  /items-center/,
  /justify-center/,
  /mx-auto/,
  /space-y-\d+/,
  /space-x-\d+/,
  /gap-\d+/,
];

const layoutPatterns: LayoutPattern[] = [
  {
    id: 'symmetrical-3-column-grid',
    name: 'Symmetrical 3-column grid (AI favorite)',
    severity: 'high',
    score: 0.7,
    tags: ['grid', 'symmetry', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const grids = elements.filter(el => {
        if (!el.className) return false;
        return GRID_CLASS_PATTERNS.some(p => p.test(el.className!));
      });

      for (const grid of grids) {
        const childElements = grid.children.filter(c => c.type === 'element');
        const cardCount = childElements.filter(c => {
          if (!c.element?.className) return false;
          return CARD_CLASS_PATTERNS.some(p => p.test(c.element!.className!));
        }).length;

        if (childElements.length === 3 && cardCount >= 2) {
          findings.push({
            id: `grid-3col-${grid.tagName}-${grid.depth}`,
            detectorId: 'layout-detector',
            severity: 'high',
            message: 'AI-typical 3-column grid layout detected',
            explanation: '3-column grids with card-like children are the #1 hallmark of AI-generated UI. Real products vary column counts.',
            location: {
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
            element: grid,
            score: 0.7,
            tags: ['grid', 'symmetry', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'excessive-symmetry',
    name: 'Excessive layout symmetry',
    severity: 'medium',
    score: 0.5,
    tags: ['symmetry', 'layout'],
    check: (elements) => {
      const findings: Finding[] = [];
      const containers = elements.filter(el => {
        if (!el.className) return false;
        return SYMMETRY_PATTERNS.some(p => p.test(el.className!));
      });

      const symmetricParents = new Map<JSXElementInfo, number>();
      for (const el of containers) {
        if (el.parent) {
          symmetricParents.set(el.parent, (symmetricParents.get(el.parent) || 0) + 1);
        }
      }

      for (const [parent, count] of symmetricParents) {
        if (count >= 3) {
          findings.push({
            id: `excessive-symmetry-${parent.tagName}-${parent.depth}`,
            detectorId: 'layout-detector',
            severity: 'medium',
            message: `Container has ${count} symmetric child properties`,
            explanation: 'AI tends to center and symmetrize everything. Real UIs have intentional asymmetry for visual hierarchy.',
            location: {
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
            element: parent,
            score: 0.5,
            tags: ['symmetry', 'layout'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'card-farm',
    name: 'Repetitive card structures',
    severity: 'high',
    score: 0.75,
    tags: ['cards', 'repetition', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const parentGroups = new Map<string, JSXElementInfo[]>();

      for (const el of elements) {
        if (!el.className) continue;
    if (!CARD_CLASS_PATTERNS.some(p => p.test(el.className!))) continue;
        const parentKey = el.parent ? `${el.parent.tagName}-${el.parent.depth}` : 'root';
        if (!parentGroups.has(parentKey)) {
          parentGroups.set(parentKey, []);
        }
        parentGroups.get(parentKey)!.push(el);
      }

      for (const [key, cards] of parentGroups) {
        if (cards.length >= 3) {
          const first = cards[0];
          findings.push({
            id: `card-farm-${key}`,
            detectorId: 'layout-detector',
            severity: 'high',
            message: `${cards.length} visually identical card structures detected`,
            explanation: 'AI generates cards with nearly identical structures (rounded-xl shadow-lg p-6 bg-white). Real products use varied card styles.',
            location: {
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
            element: first,
            score: 0.75,
            tags: ['cards', 'repetition', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'container-soup',
    name: 'Deeply nested container structure',
    severity: 'low',
    score: 0.3,
    tags: ['nesting', 'structure'],
    check: (elements) => {
      const findings: Finding[] = [];
      const divs = elements.filter(el => el.tagName === 'div' || el.tagName === 'section');

      for (const el of divs) {
        if (el.depth >= 6) {
          findings.push({
            id: `deep-nest-${el.tagName}-${el.depth}`,
            detectorId: 'layout-detector',
            severity: 'low',
            message: `Deeply nested ${el.tagName} at depth ${el.depth}`,
            explanation: 'AI often wraps elements in unnecessary containers. Real code prefers flatter structures.',
            location: {
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
            element: el,
            score: 0.3,
            tags: ['nesting', 'structure'],
          });
        }
      }
      return findings;
    },
  },
];

export function detectLayoutPatterns(elements: JSXElementInfo[]): DetectorResult {
  const allFindings: Finding[] = [];
  for (const pattern of layoutPatterns) {
    const findings = pattern.check(elements);
    allFindings.push(...findings);
  }
  return {
    detectorId: 'layout-detector',
    findings: allFindings,
  };
}

export function getLayoutPatterns() {
  return layoutPatterns;
}
