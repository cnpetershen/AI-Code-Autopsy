import { Finding, TransformResult } from '../ast/types.js';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { parse } from '@babel/parser';
import type { File, JSXAttribute, StringLiteral, JSXElement } from '@babel/types';

interface ClassReplacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const AI_CLASS_REPLACEMENTS: ClassReplacement[] = [
  { pattern: /backdrop-blur-[^\s]*/g, replacement: 'bg-white/80', description: 'Replace glassmorphism with simple background' },
  { pattern: /bg-gradient-to-[brtrbl][^\s]*/g, replacement: 'bg-white', description: 'Replace gradient backgrounds with solid' },
  { pattern: /shadow-(xl|2xl)/g, replacement: 'shadow-sm', description: 'Reduce heavy shadows to subtle' },
  { pattern: /rounded-(2xl|3xl)/g, replacement: 'rounded-lg', description: 'Reduce excessive border radius' },
  { pattern: /hover:-translate-y-[^\s]*/g, replacement: '', description: 'Remove AI hover animations' },
  { pattern: /transition-all/g, replacement: 'transition-colors', description: 'Narrow transition scope' },
  { pattern: /animate-(pulse|bounce|spin)/g, replacement: '', description: 'Remove decorative animations' },
  { pattern: /dark:bg-gray-800/g, replacement: 'dark:bg-gray-900', description: 'Use natural dark mode color' },
  { pattern: /bg-opacity-\d+/g, replacement: '', description: 'Remove opacity modifiers' },
  { pattern: /text-gradient/g, replacement: 'font-bold', description: 'Replace gradient text with bold' },
];

function modifyClassNameInAST(ast: File, replacements: ClassReplacement[]): string[] {
  const changes: string[] = [];

  function walk(node: any): void {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'JSXAttribute' && node.name && node.name.name === 'className' && node.value) {
      let originalValue: string | null = null;
      if (node.value.type === 'StringLiteral') {
        originalValue = node.value.value;
      } else if (
        node.value.type === 'JSXExpressionContainer' &&
        node.value.expression.type === 'StringLiteral'
      ) {
        originalValue = node.value.expression.value;
      }

      if (originalValue) {
        let newValue = originalValue;
        for (const r of replacements) {
          const before = newValue;
          newValue = newValue.replace(r.pattern, (match) => {
            changes.push(`[class] ${r.description}: "${match}" -> "${r.replacement}"`);
            return r.replacement;
          });
        }

        if (newValue !== originalValue) {
          newValue = newValue.replace(/\s+/g, ' ').trim();
          const newLiteral = t.stringLiteral(newValue);
          if (node.value.type === 'StringLiteral') {
            (node.value as StringLiteral).value = newValue;
          } else if (
            node.value.type === 'JSXExpressionContainer' &&
            node.value.expression.type === 'StringLiteral'
          ) {
            (node.value.expression as StringLiteral).value = newValue;
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
  return changes;
}

export function transformClasses(source: string, findings: Finding[]): TransformResult {
  const changes: string[] = [];
  const guardrailViolations: string[] = [];

  if (findings.length === 0) {
    return { success: false, code: source, changes, guardrailViolations };
  }

  let ast: File;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      errorRecovery: true,
    }) as File;
  } catch {
    return { success: false, code: source, changes, guardrailViolations: ['Failed to parse source for AST transform'] };
  }

  const classChanges = modifyClassNameInAST(ast, AI_CLASS_REPLACEMENTS);
  changes.push(...classChanges);

  if (changes.length === 0) {
    return { success: false, code: source, changes, guardrailViolations };
  }

  const output = generate(ast as any, { retainLines: false, compact: false });
  const code = output.code;

  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 200) {
      guardrailViolations.push(`Line ${i + 1}: exceeds 200 chars after transform (${lines[i].length})`);
    }
  }

  return {
    success: true,
    code,
    changes,
    guardrailViolations,
  };
}

export function getClassReplacementDescription(pattern: RegExp): string {
  const found = AI_CLASS_REPLACEMENTS.find(r => r.pattern.source === pattern.source);
  return found?.description || 'Unknown replacement';
}
