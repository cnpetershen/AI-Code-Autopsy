import { parse } from '@babel/parser';
import type { Node, File, JSXElement, JSXFragment, JSXAttribute, JSXText, JSXExpressionContainer, JSXSpreadChild } from '@babel/types';
import { JSXElementInfo, JSXAttributeInfo, JSXChildInfo, UIFile, ParseError } from './types.js';

export function parseUI(source: string): UIFile {
  const errors: ParseError[] = [];
  let ast: File;

  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
      errorRecovery: true,
    });
  } catch (e: any) {
    errors.push({
      message: e.message || 'Failed to parse source',
    });
    return {
      ast: { type: 'Error' } as any,
      source,
      elements: [],
      errors,
    };
  }

  const parseResult = ast as any;
  if (parseResult.errors) {
    for (const err of parseResult.errors) {
      errors.push({
        message: err.message,
        line: err.loc?.line,
        column: err.loc?.column,
      });
    }
  }

  const elements: JSXElementInfo[] = [];
  extractJSXElements(ast, elements, 0);

  return {
    ast,
    source,
    elements,
    errors,
  };
}

function extractJSXElements(
  node: Node,
  elements: JSXElementInfo[],
  depth: number,
  parent?: JSXElementInfo
): void {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'JSXElement') {
    const jsxNode = node as JSXElement;
    const info = buildJSXElementInfo(jsxNode, depth, parent);
    elements.push(info);

    for (const child of info.children) {
      if (child.type === 'element') {
        extractJSXElements(child.node, elements, depth + 1, info);
      }
    }
    return;
  }

  if (node.type === 'JSXFragment') {
    for (const child of (node as JSXFragment).children) {
      extractJSXElements(child, elements, depth, parent);
    }
    return;
  }

  for (const key of Object.keys(node as any)) {
    const val = (node as any)[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item.type === 'string') {
          extractJSXElements(item, elements, depth, parent);
        }
      }
    } else if (val && typeof val.type === 'string') {
      extractJSXElements(val, elements, depth, parent);
    }
  }
}

function buildJSXElementInfo(node: JSXElement, depth: number, parent?: JSXElementInfo): JSXElementInfo {
  const tagName = getTagName(node);
  const attrs = extractAttributes(node);

  const classNameAttr = attrs.find(
    a => a.name === 'className' || a.name === 'class'
  );
  const className = typeof classNameAttr?.value === 'string' ? classNameAttr.value : undefined;

  const info: JSXElementInfo = {
    node,
    tagName,
    attributes: attrs,
    children: [],
    className,
    depth,
    parent,
  };

  info.children = extractChildren(node, depth, info);
  return info;
}

function getTagName(node: JSXElement): string {
  const opening = node.openingElement;
  const name = opening.name;
  if (name.type === 'JSXIdentifier') {
    return name.name;
  }
  if (name.type === 'JSXMemberExpression') {
    const obj = name.object as any;
    const prop = name.property as any;
    return `${obj.name || 'unknown'}.${prop.name || 'unknown'}`;
  }
  if (name.type === 'JSXNamespacedName') {
    return `${name.namespace.name}:${name.name.name}`;
  }
  return 'unknown';
}

function extractAttributes(node: JSXElement): JSXAttributeInfo[] {
  const result: JSXAttributeInfo[] = [];
  for (const attr of node.openingElement.attributes) {
    if (attr.type === 'JSXAttribute') {
      let value: string | boolean | number | null = true;
      if (attr.value) {
        if (attr.value.type === 'StringLiteral') {
          value = attr.value.value;
        } else if (attr.value.type === 'JSXExpressionContainer') {
          const expr = attr.value.expression;
          if (expr.type === 'StringLiteral') {
            value = expr.value;
          } else if (expr.type === 'NumericLiteral') {
            value = expr.value;
          } else if (expr.type === 'BooleanLiteral') {
            value = expr.value;
          } else {
            value = `{${expr.type}}`;
          }
        }
      }
      const name = typeof attr.name === 'object' && 'name' in attr.name
        ? (attr.name as any).name
        : 'unknown';
      result.push({ name, value, node: attr });
    } else {
      result.push({ name: '...spread', value: null, node: attr });
    }
  }
  return result;
}

function extractChildren(node: JSXElement, parentDepth: number, parent?: JSXElementInfo): JSXChildInfo[] {
  const result: JSXChildInfo[] = [];
  for (const child of node.children) {
    if (child.type === 'JSXElement') {
      const childEl = buildJSXElementInfo(child as JSXElement, parentDepth + 1, parent);
      result.push({
        type: 'element',
        node: child,
        element: childEl,
      });
    } else if (child.type === 'JSXText') {
      const text = (child as JSXText).value.trim();
      if (text) {
        result.push({
          type: 'text',
          node: child,
          text,
        });
      }
    } else if (child.type === 'JSXExpressionContainer') {
      result.push({
        type: 'expression',
        node: child,
      });
    } else if (child.type === 'JSXFragment') {
      result.push({
        type: 'fragment',
        node: child,
      });
    } else if (child.type === 'JSXSpreadChild') {
      result.push({
        type: 'spread',
        node: child,
      });
    }
  }
  return result;
}
