import { JSXElementInfo, UIMetrics } from '../ast/types';
import { classifyClassTokenDensity } from '../utils/tailwindTokens';
import { tokenizeTailwind } from '../utils/tailwindTokens';

export function computeMetrics(elements: JSXElementInfo[]): UIMetrics {
  const maxDepth = elements.length > 0 ? Math.max(...elements.map(e => e.depth)) : 0;
  const totalDepth = elements.reduce((s, e) => s + e.depth, 0);

  const tagCounts = new Map<string, number>();
  for (const el of elements) {
    tagCounts.set(el.tagName, (tagCounts.get(el.tagName) || 0) + 1);
  }

  const gridElements = elements.filter(el =>
    el.className && /grid/.test(el.className)
  );

  const cardLikeElements = elements.filter(el => {
    if (!el.className) return false;
    return /rounded-(lg|xl|2xl)/.test(el.className) &&
      /shadow/.test(el.className);
  });

  const symmetryScore = computeSymmetryScore(elements);
  const repetitionScore = computeRepetitionScore(elements);

  const { averageTokensPerElement, aiTokenCount } = classifyClassTokenDensity(elements);

  const structuralEntropy = computeStructuralEntropy(elements, tagCounts);

  return {
    elementCount: elements.length,
    uniqueTagCount: tagCounts.size,
    maxDepth,
    averageDepth: elements.length > 0 ? totalDepth / elements.length : 0,
    gridStructures: gridElements.length,
    cardLikeElements: cardLikeElements.length,
    symmetryScore,
    repetitionScore,
    classTokenDensity: averageTokensPerElement,
    structuralEntropy,
  };
}

function computeSymmetryScore(elements: JSXElementInfo[]): number {
  let symmetricCount = 0;
  let totalContainers = 0;

  const parentChildCounts = new Map<JSXElementInfo, number>();
  for (const el of elements) {
    if (el.parent) {
      parentChildCounts.set(el.parent, (parentChildCounts.get(el.parent) || 0) + 1);
    }
  }

  for (const [parent, count] of parentChildCounts) {
    totalContainers++;
    if (count === 2 || count === 3 || count === 4 || count === 6) {
      symmetricCount++;
    }
  }

  return totalContainers > 0 ? symmetricCount / totalContainers : 0;
}

function computeRepetitionScore(elements: JSXElementInfo[]): number {
  if (elements.length < 4) return 0;

  const signatureMap = new Map<string, number>();

  for (const el of elements) {
    const childTags = el.children
      .filter(c => c.type === 'element')
      .map(c => c.element?.tagName || 'unknown')
      .sort()
      .join(',');

    if (childTags) {
      signatureMap.set(childTags, (signatureMap.get(childTags) || 0) + 1);
    }
  }

  let repeatedCount = 0;
  for (const [_, count] of signatureMap) {
    if (count >= 3) {
      repeatedCount += count;
    }
  }

  return elements.length > 0 ? repeatedCount / elements.length : 0;
}

function computeStructuralEntropy(
  elements: JSXElementInfo[],
  tagCounts: Map<string, number>
): number {
  if (elements.length < 2) return 0;

  const total = elements.length;
  let entropy = 0;

  for (const [_, count] of tagCounts) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(tagCounts.size);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}
