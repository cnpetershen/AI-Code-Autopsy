import { JSXElementInfo, Finding, TransformResult } from '../ast/types.js';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { parse } from '@babel/parser';
import type { File, JSXElement, JSXIdentifier } from '@babel/types';

interface SemanticMapping {
  fromTag: string;
  toTag: string;
  condition: (element: JSXElementInfo) => boolean;
  description: string;
}

const SEMANTIC_MAP: SemanticMapping[] = [
  {
    fromTag: 'div', toTag: 'nav',
    condition: (el) => {
      const hasLinks = el.children.some(c => c.element?.tagName === 'a');
      return hasLinks && el.parent?.tagName === 'header';
    },
    description: 'Convert navigation div to <nav>',
  },
  {
    fromTag: 'div', toTag: 'main',
    condition: (el) => el.depth <= 2 && el.children.some(c => c.element?.tagName === 'section'),
    description: 'Convert content div to <main>',
  },
  {
    fromTag: 'div', toTag: 'article',
    condition: (el) => {
      const hasHeading = el.children.some(c => /^h[1-6]$/.test(c.element?.tagName || ''));
      return hasHeading && el.children.some(c => c.element?.tagName === 'p');
    },
    description: 'Convert content div to <article>',
  },
  {
    fromTag: 'div', toTag: 'section',
    condition: (el) => {
      const hasSubheading = el.children.some(c => /^h[2-6]$/.test(c.element?.tagName || ''));
      return hasSubheading && el.depth >= 2;
    },
    description: 'Convert section div to <section>',
  },
  {
    fromTag: 'div', toTag: 'aside',
    condition: (el) => !!(el.className?.includes('sidebar') || el.className?.includes('aside')),
    description: 'Convert sidebar div to <aside>',
  },
];

function mutateSemanticTagsInAST(ast: File, elements: JSXElementInfo[]): string[] {
  const changes: string[] = [];
  const processedNodes = new Set<JSXElement>();

  function walk(node: any): void {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXElement') {
      const jsxNode = node as JSXElement;
      const name = jsxNode.openingElement.name;
      const tagName = name.type === 'JSXIdentifier' ? name.name : '';

      const matchingMapping = SEMANTIC_MAP.find(
        m => m.fromTag === tagName && elements.some(
          el => el.node === jsxNode && m.condition(el)
        )
      );

      if (matchingMapping && !processedNodes.has(jsxNode)) {
        processedNodes.add(jsxNode);
        if (name.type === 'JSXIdentifier') {
          (name as JSXIdentifier).name = matchingMapping.toTag;
          if (jsxNode.closingElement?.name?.type === 'JSXIdentifier') {
            (jsxNode.closingElement.name as JSXIdentifier).name = matchingMapping.toTag;
          }
          changes.push(`[semantic] ${matchingMapping.description}`);
        }
      }
    }

    for (const key of Object.keys(node)) {
      const val = node[key];
      if (Array.isArray(val)) {
        for (const item of val) walk(item);
      } else if (val && typeof val.type === 'string') {
        walk(val);
      }
    }
  }

  walk(ast);
  return changes;
}

export function fixSemanticHTML(source: string, elements: JSXElementInfo[], findings: Finding[]): TransformResult {
  let ast: File;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      errorRecovery: true,
    }) as File;
  } catch {
    return { success: false, code: source, changes: [], guardrailViolations: ['Failed to parse for semantic fix'] };
  }

  const changes = mutateSemanticTagsInAST(ast, elements);

  if (changes.length === 0) {
    return { success: false, code: source, changes: [], guardrailViolations: [] };
  }

  const output = generate(ast as any, { retainLines: false, compact: false });

  return {
    success: true,
    code: output.code,
    changes,
    guardrailViolations: [],
  };
}
