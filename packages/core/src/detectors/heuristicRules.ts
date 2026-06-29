import { JSXElementInfo, Finding, DetectorResult } from '../ast/types';

export interface HeuristicRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  tags: string[];
  check: (elements: JSXElementInfo[]) => Finding[];
}

const heuristicRules: HeuristicRule[] = [
  {
    id: 'repetitive-text-content',
    name: 'Repetitive text content across siblings',
    description: 'Detects when multiple sibling elements have similar text lengths and patterns',
    severity: 'medium',
    score: 0.5,
    tags: ['repetition', 'content'],
    check: (elements) => {
      const findings: Finding[] = [];
      const parentGroups = new Map<string, string[]>();

      for (const el of elements) {
        const parentKey = el.parent ? `${el.parent.tagName}-${el.parent.depth}` : 'root';
        const texts = el.children.filter(c => c.type === 'text').map(c => c.text || '');
        const combined = texts.join(' ').trim();
        if (combined.length > 5) {
          if (!parentGroups.has(parentKey)) {
            parentGroups.set(parentKey, []);
          }
          parentGroups.get(parentKey)!.push(combined);
        }
      }

      for (const [key, texts] of parentGroups) {
        if (texts.length >= 3) {
          const avgLen = texts.reduce((s, t) => s + t.length, 0) / texts.length;
          const variance = texts.reduce((s, t) => s + Math.pow(t.length - avgLen, 2), 0) / texts.length;
          if (variance < 100) {
            findings.push({
              id: `repetitive-text-${key}`,
              detectorId: 'heuristic-rules',
              severity: 'medium',
              message: `Sibling elements have suspiciously similar text lengths (variance: ${variance.toFixed(0)})`,
              explanation: 'AI generates text blocks with nearly identical lengths. Human-written content has more variation.',
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
              element: elements[0],
              score: 0.5,
              tags: ['repetition', 'content'],
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: 'icon-every-card',
    name: 'Every card has an identical icon structure',
    description: 'Detects when every sibling card contains an icon in the same position',
    severity: 'high',
    score: 0.7,
    tags: ['icons', 'cards', 'repetition'],
    check: (elements) => {
      const findings: Finding[] = [];
      const parentMap = new Map<string, JSXElementInfo[]>();

      for (const el of elements) {
        if (!el.className) continue;
        if (!/rounded-(lg|xl|2xl)/.test(el.className)) continue;
        const key = el.parent ? `${el.parent.tagName}-${el.parent.depth}` : 'root';
        if (!parentMap.has(key)) parentMap.set(key, []);
        parentMap.get(key)!.push(el);
      }

      for (const [key, cards] of parentMap) {
        if (cards.length < 3) continue;

        let allHaveIconChildren = true;
        for (const card of cards) {
          const iconChildren = card.children.filter(c => {
            if (!c.element) return false;
            return c.element.tagName === 'div' &&
              c.element.className?.includes('w-') &&
              c.element.className?.includes('h-');
          });
          if (iconChildren.length === 0) {
            allHaveIconChildren = false;
            break;
          }
        }

        if (allHaveIconChildren) {
          findings.push({
            id: `icon-every-card-${key}`,
            detectorId: 'heuristic-rules',
            severity: 'high',
            message: `All ${cards.length} cards contain icon placeholders`,
            explanation: 'AI puts an icon div in every feature card. Real products mix media types (icons, images, illustrations).',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: cards[0],
            score: 0.7,
            tags: ['icons', 'cards', 'repetition'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'over-engineered-classnames',
    name: 'Excessive class name complexity',
    description: 'Detects elements with too many Tailwind classes',
    severity: 'low',
    score: 0.3,
    tags: ['tailwind', 'complexity'],
    check: (elements) => {
      const findings: Finding[] = [];
      for (const el of elements) {
        if (!el.className) continue;
        const classCount = el.className.trim().split(/\s+/).length;
        if (classCount >= 8) {
          findings.push({
            id: `excessive-classes-${el.tagName}-${el.depth}`,
            detectorId: 'heuristic-rules',
            severity: 'low',
            message: `Element has ${classCount} Tailwind classes (over-engineered)`,
            explanation: 'AI tends to add many utility classes on single elements. Human-written code typically extracts components or uses cleaner class groups.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: el,
            score: 0.3,
            tags: ['tailwind', 'complexity'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'ai-comment-signature',
    name: 'AI-generated comment markers',
    description: 'Detects comments left by AI code generation',
    severity: 'low',
    score: 0.2,
    tags: ['comments', 'metadata'],
    check: (elements) => {
      const findings: Finding[] = [];
      for (const el of elements) {
        const texts = el.children.filter(c => c.type === 'text').map(c => c.text || '');
        const fullText = texts.join(' ');
        const aiMarkers = [
          /created with/i, /generated by/i, /powered by/i,
          /using AI/i, /auto-generated/i, /automatically generated/i,
        ];
        for (const marker of aiMarkers) {
          if (marker.test(fullText)) {
            findings.push({
              id: `ai-comment-${el.tagName}-${el.depth}`,
              detectorId: 'heuristic-rules',
              severity: 'low',
              message: 'Text contains AI-generation markers',
              explanation: 'AI sometimes leaves generation markers in text content.',
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
              element: el,
              score: 0.2,
              tags: ['comments', 'metadata'],
            });
            break;
          }
        }
      }
      return findings;
    },
  },
  {
    id: 'no-semantic-html',
    name: 'Overuse of div instead of semantic HTML',
    description: 'Detects when divs are used where semantic elements would be appropriate',
    severity: 'medium',
    score: 0.4,
    tags: ['semantic', 'accessibility'],
    check: (elements) => {
      const findings: Finding[] = [];
      const divCount = elements.filter(e => e.tagName === 'div').length;
      const totalElements = elements.length;

      if (totalElements > 0 && (divCount / totalElements) > 0.7) {
        findings.push({
          id: `too-many-divs`,
          detectorId: 'heuristic-rules',
          severity: 'medium',
          message: `${Math.round(divCount / totalElements * 100)}% of elements are divs (semantic HTML lacking)`,
          explanation: 'AI overuses div elements instead of semantic HTML (header, nav, main, article, aside, section). Real code uses more semantic elements.',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          element: elements[0],
          score: 0.4,
          tags: ['semantic', 'accessibility'],
        });
      }
      return findings;
    },
  },
];

export function detectHeuristics(elements: JSXElementInfo[]): DetectorResult {
  const allFindings: Finding[] = [];
  for (const rule of heuristicRules) {
    const findings = rule.check(elements);
    allFindings.push(...findings);
  }
  return {
    detectorId: 'heuristic-rules',
    findings: allFindings,
  };
}

export function getHeuristicRules() {
  return heuristicRules;
}
