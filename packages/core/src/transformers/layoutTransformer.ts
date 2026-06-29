import { JSXElementInfo, Finding, TransformResult } from '../ast/types';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { parse } from '@babel/parser';
import type { File, StringLiteral } from '@babel/types';

interface LayoutChange {
  fromClass: RegExp;
  toClass: string;
  description: string;
  semantic: 'grid-to-flex' | 'grid-to-block' | 'flex-to-grid' | 'flex-to-block' | 'col-count-change';
}

const DISPLAY_CHANGES: LayoutChange[] = [
  { fromClass: /grid-cols-3/g, toClass: 'flex flex-wrap gap-4', description: 'Break 3-column grid into flexbox wrap', semantic: 'grid-to-flex' },
  { fromClass: /grid-cols-2/g, toClass: 'grid-cols-1 sm:grid-cols-2', description: 'Make 2-column grid responsive', semantic: 'col-count-change' },
  { fromClass: /grid-cols-4/g, toClass: 'grid-cols-2 lg:grid-cols-4', description: 'Break 4-column grid into responsive', semantic: 'col-count-change' },
  { fromClass: /flex-row/g, toClass: 'flex-col md:flex-row', description: 'Stack flex items vertically on mobile', semantic: 'flex-to-grid' },
];

const CARD_STYLE_CHANGES = [
  { fromClass: /rounded-xl/g, toClass: 'rounded-lg', description: 'Reduce border radius variation' },
  { fromClass: /shadow-lg/g, toClass: 'border border-gray-200', description: 'Replace shadow with subtle border' },
  { fromClass: /shadow-xl/g, toClass: 'border border-gray-300', description: 'Replace heavy shadow with border' },
  { fromClass: /p-6/g, toClass: 'p-4', description: 'Reduce card padding' },
  { fromClass: /bg-white dark:bg-gray-800/g, toClass: 'bg-gray-50 dark:bg-gray-900', description: 'Use varied backgrounds' },
  { fromClass: /text-center/g, toClass: 'text-left', description: 'Use left-aligned text instead of centered' },
];

function mutateClassNameInAST(ast: File, changes: LayoutChange[], findings: Finding[]): string[] {
  const applied: string[] = [];

  function walk(node: any): void {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXAttribute' && node.name?.name === 'className' && node.value) {
      let originalValue: string | null = null;
      if (node.value.type === 'StringLiteral') {
        originalValue = node.value.value;
      } else if (node.value.type === 'JSXExpressionContainer' && node.value.expression.type === 'StringLiteral') {
        originalValue = node.value.expression.value;
      }

      if (originalValue) {
        let newValue = originalValue;

        for (const ch of changes) {
          if (ch.fromClass.test(newValue)) {
            newValue = newValue.replace(ch.fromClass, ch.toClass);
            applied.push(`[layout] ${ch.description} (${ch.semantic})`);
          }
        }

        if (newValue !== originalValue) {
          newValue = newValue.replace(/\s+/g, ' ').trim();
          const target = node.value.type === 'JSXExpressionContainer' ? node.value.expression : node.value;
          if (target.type === 'StringLiteral') {
            (target as StringLiteral).value = newValue;
          }
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
  return applied;
}

function mutateCardStylesInAST(ast: File): string[] {
  const applied: string[] = [];

  function walk(node: any): void {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXAttribute' && node.name?.name === 'className' && node.value) {
      let originalValue: string | null = null;
      if (node.value.type === 'StringLiteral') {
        originalValue = node.value.value;
      } else if (node.value.type === 'JSXExpressionContainer' && node.value.expression.type === 'StringLiteral') {
        originalValue = node.value.expression.value;
      }

      if (originalValue) {
        let newValue = originalValue;
        let styleIndex = 0;

        for (const ch of CARD_STYLE_CHANGES) {
          if (ch.fromClass.test(newValue)) {
            newValue = newValue.replace(ch.fromClass, (match) => {
              styleIndex++;
              if (styleIndex % 2 === 0) {
                applied.push(`[card] ${ch.description} (card ${styleIndex})`);
                return ch.toClass;
              }
              return match;
            });
          }
        }

        if (newValue !== originalValue) {
          newValue = newValue.replace(/\s+/g, ' ').trim();
          const target = node.value.type === 'JSXExpressionContainer' ? node.value.expression : node.value;
          if (target.type === 'StringLiteral') {
            (target as StringLiteral).value = newValue;
          }
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
  return applied;
}

export function transformLayout(source: string, findings: Finding[]): TransformResult {
  const allChanges: string[] = [];
  const guardrailViolations: string[] = [];

  let ast: File;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      errorRecovery: true,
    }) as File;
  } catch {
    return { success: false, code: source, changes: [], guardrailViolations: ['Failed to parse for layout transform'] };
  }

  const layoutChanges = mutateClassNameInAST(ast, DISPLAY_CHANGES, findings);
  allChanges.push(...layoutChanges);

  const cardChanges = mutateCardStylesInAST(ast);
  allChanges.push(...cardChanges);

  if (allChanges.length === 0) {
    return { success: false, code: source, changes: [], guardrailViolations };
  }

  const output = generate(ast as any, { retainLines: false, compact: false });

  return {
    success: true,
    code: output.code,
    changes: allChanges,
    guardrailViolations,
  };
}
