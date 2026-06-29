import { JSXElementInfo, Finding, DetectorResult } from '../ast/types';
import { queryElements, findChildren } from '../ast/traverse';
import { tokenizeTailwind } from './tailwindDetector';

interface AIPatternRule {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  tags: string[];
  check: (elements: JSXElementInfo[], source: string) => Finding[];
}

const NTH_CHILD_PATTERN = /nth-child|nth-of-type/;
const TRANSITION_PATTERN = /transition-all|transition-transform/;

const aiPatternRules: AIPatternRule[] = [
  {
    id: 'hero-section-stack',
    name: 'Standard AI hero section (heading + subtitle + CTA buttons)',
    severity: 'high',
    score: 0.8,
    tags: ['hero', 'layout', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const sections = elements.filter(el =>
        el.tagName === 'section' || el.tagName === 'div'
      );

      for (const section of sections) {
        const children = section.children.filter(c => c.type === 'element');
        if (children.length < 3 || children.length > 6) continue;

        const headingChildren = children.filter(c =>
          c.element?.tagName === 'h1' || c.element?.tagName === 'h2'
        );
        const buttonChildren = children.filter(c =>
          c.element?.tagName === 'button' || c.element?.tagName === 'a'
        );
        const paraChildren = children.filter(c =>
          c.element?.tagName === 'p'
        );

        if (headingChildren.length >= 1 && buttonChildren.length >= 1 && paraChildren.length >= 1) {
          findings.push({
            id: `hero-stack-${section.depth}`,
            detectorId: 'ai-pattern-detector',
            severity: 'high',
            message: 'AI-typical hero section: heading + paragraph + buttons',
            explanation: 'AI generates hero sections with identical structure: a centered heading, supporting paragraph, and 2 CTA buttons. Real products vary this pattern.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: section,
            score: 0.8,
            tags: ['hero', 'layout', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'feature-section-grid',
    name: 'Feature section: icon + title + description grid',
    severity: 'high',
    score: 0.75,
    tags: ['features', 'grid', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const grids = elements.filter(el => {
        if (!el.className) return false;
        return /grid-cols-[23]/.test(el.className);
      });

      for (const grid of grids) {
        const children = grid.children.filter(c => c.type === 'element');
        if (children.length < 3 || children.length > 6) continue;

        let iconCount = 0;
        let titleCount = 0;
        let descCount = 0;

        for (const child of children) {
          if (!child.element) continue;
          const grandChildren = child.element.children.filter(c => c.type === 'element');
          for (const gc of grandChildren) {
            if (!gc.element) continue;
            if (gc.element.tagName === 'div' || gc.element.tagName === 'span') {
              if (gc.element.className?.includes('icon') || gc.element.className?.includes('w-6') || gc.element.className?.includes('h-6')) {
                iconCount++;
              }
            }
            if (gc.element.tagName === 'h3') titleCount++;
            if (gc.element.tagName === 'p') descCount++;
          }
        }

        if (iconCount >= 2 && titleCount >= 2 && descCount >= 2) {
          findings.push({
            id: `feature-grid-${grid.depth}`,
            detectorId: 'ai-pattern-detector',
            severity: 'high',
            message: 'AI-typical feature section: icon + h3 + p grid',
            explanation: 'AI loves the "feature card" pattern with an icon, heading, and description in every grid cell. This is a signature AI template.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: grid,
            score: 0.75,
            tags: ['features', 'grid', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'testimonial-card',
    name: 'Standard testimonial card (avatar + quote + name)',
    severity: 'medium',
    score: 0.6,
    tags: ['testimonial', 'cards', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const cards = elements.filter(el => {
        if (!el.className) return false;
        return /rounded-(xl|2xl)/.test(el.className) && /shadow/.test(el.className);
      });

      for (const card of cards) {
        const children = card.children.filter(c => c.type === 'element');
        const imgChildren = children.filter(c => c.element?.tagName === 'img');
        const blockquoteChildren = children.filter(c =>
          c.element?.tagName === 'p' || c.element?.tagName === 'blockquote'
        );

        if (imgChildren.length >= 1 && blockquoteChildren.length >= 1) {
          findings.push({
            id: `testimonial-card-${card.depth}`,
            detectorId: 'ai-pattern-detector',
            severity: 'medium',
            message: 'AI-typical testimonial card: avatar + quote + name',
            explanation: 'Testimonial sections with avatar images, quote text, and author names in every card are a common AI template.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: card,
            score: 0.6,
            tags: ['testimonial', 'cards', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'footer-stack',
    name: 'Standard AI footer (4-column links)',
    severity: 'medium',
    score: 0.5,
    tags: ['footer', 'layout', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const footers = elements.filter(el => el.tagName === 'footer');

      for (const footer of footers) {
        const columns = footer.children.filter(c => c.type === 'element');
        const linkColumns = columns.filter(c => {
          if (!c.element) return false;
          const links = c.element.children.filter(gc => gc.element?.tagName === 'a');
          return links.length >= 2;
        });

        if (linkColumns.length >= 3) {
          findings.push({
            id: `footer-4col-${footer.depth}`,
            detectorId: 'ai-pattern-detector',
            severity: 'medium',
            message: 'AI-typical footer with multi-column link layout',
            explanation: 'AI generates footers with 3-4 columns of links with identical structure. Real footers are more varied.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: footer,
            score: 0.5,
            tags: ['footer', 'layout', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'pricing-cards',
    name: 'Pricing card trio (basic/pro/enterprise)',
    severity: 'high',
    score: 0.85,
    tags: ['pricing', 'cards', 'ai-pattern'],
    check: (elements) => {
      const findings: Finding[] = [];
      const sections = elements.filter(el => el.tagName === 'section');

      for (const section of sections) {
        const children = section.children.filter(c => c.type === 'element');
        if (children.length !== 3) continue;

        let hasPrice = 0;
        let hasButton = 0;
        for (const child of children) {
          if (!child.element) continue;
          const text = child.element.children
            .filter(gc => gc.type === 'text')
            .map(gc => gc.text || '')
            .join(' ');
          const btnChildren = child.element.children.filter(gc =>
            gc.element?.tagName === 'button'
          );
          if (/\$\d+/.test(text)) hasPrice++;
          if (btnChildren.length > 0) hasButton++;
        }

        if (hasPrice >= 2 && hasButton >= 2) {
          findings.push({
            id: `pricing-trio-${section.depth}`,
            detectorId: 'ai-pattern-detector',
            severity: 'high',
            message: 'AI-typical pricing cards: Basic / Pro / Enterprise trio',
            explanation: 'Three pricing cards with price text and CTA buttons is the most recognizable AI template pattern.',
            location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            element: section,
            score: 0.85,
            tags: ['pricing', 'cards', 'ai-pattern'],
          });
        }
      }
      return findings;
    },
  },
];

export function detectAIPatterns(elements: JSXElementInfo[], source: string): DetectorResult {
  const allFindings: Finding[] = [];
  for (const rule of aiPatternRules) {
    const findings = rule.check(elements, source);
    allFindings.push(...findings);
  }
  return {
    detectorId: 'ai-pattern-detector',
    findings: allFindings,
  };
}

export function getAIPatternRules() {
  return aiPatternRules;
}
