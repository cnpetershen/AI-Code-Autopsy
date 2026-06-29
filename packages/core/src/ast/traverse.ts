import { JSXElementInfo, ASTQuery } from './types.js';

export interface TraverseVisitor {
  onElement?: (element: JSXElementInfo) => void;
  onEnter?: (element: JSXElementInfo) => boolean | void;
  onExit?: (element: JSXElementInfo) => void;
}

export function traverseElements(
  elements: JSXElementInfo[],
  visitor: TraverseVisitor
): void {
  for (const el of elements) {
    if (visitor.onEnter) {
      const shouldSkip = visitor.onEnter(el);
      if (shouldSkip === false) continue;
    }
    if (visitor.onElement) {
      visitor.onElement(el);
    }
    if (el.children) {
      const childElements: JSXElementInfo[] = [];
      collectChildElements(el, childElements);
      traverseElements(childElements, visitor);
    }
    if (visitor.onExit) {
      visitor.onExit(el);
    }
  }
}

function collectChildElements(
  parent: JSXElementInfo,
  result: JSXElementInfo[]
): void {
  for (const child of parent.children) {
    if (child.element) {
      result.push(child.element);
    }
  }
}

export function queryElements(
  elements: JSXElementInfo[],
  query: ASTQuery
): JSXElementInfo[] {
  return elements.filter(el => matchQuery(el, query));
}

function matchQuery(el: JSXElementInfo, query: ASTQuery): boolean {
  if (query.tag) {
    if (query.tag instanceof RegExp && !query.tag.test(el.tagName)) return false;
    if (typeof query.tag === 'string' && el.tagName !== query.tag) return false;
  }
  if (query.hasClass) {
    if (!el.className) return false;
    if (query.hasClass instanceof RegExp && !query.hasClass.test(el.className)) return false;
    if (typeof query.hasClass === 'string' && !el.className.includes(query.hasClass)) return false;
  }
  if (query.hasAttribute) {
    const hasAttr = el.attributes.some(a => {
      if (query.hasAttribute instanceof RegExp) return query.hasAttribute.test(a.name);
      return a.name === query.hasAttribute;
    });
    if (!hasAttr) return false;
  }
  if (query.depth) {
    if (query.depth.min !== undefined && el.depth < query.depth.min) return false;
    if (query.depth.max !== undefined && el.depth > query.depth.max) return false;
  }
  if (query.parentTag) {
    if (!el.parent) return false;
    if (query.parentTag instanceof RegExp && !query.parentTag.test(el.parent.tagName)) return false;
    if (typeof query.parentTag === 'string' && el.parent.tagName !== query.parentTag) return false;
  }
  if (query.childCount) {
    const count = el.children.filter(c => c.type === 'element').length;
    if (query.childCount.min !== undefined && count < query.childCount.min) return false;
    if (query.childCount.max !== undefined && count > query.childCount.max) return false;
  }
  if (query.hasText) {
    const texts = el.children.filter(c => c.type === 'text').map(c => c.text || '');
    const allText = texts.join(' ');
    if (query.hasText instanceof RegExp && !query.hasText.test(allText)) return false;
    if (typeof query.hasText === 'string' && !allText.includes(query.hasText)) return false;
  }
  return true;
}

export function findParent(
  element: JSXElementInfo,
  predicate: (el: JSXElementInfo) => boolean
): JSXElementInfo | null {
  let current = element.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return null;
}

export function findChildren(
  element: JSXElementInfo,
  predicate: (el: JSXElementInfo) => boolean
): JSXElementInfo[] {
  const result: JSXElementInfo[] = [];
  for (const child of element.children) {
    if (child.element && predicate(child.element)) {
      result.push(child.element);
    }
  }
  return result;
}
