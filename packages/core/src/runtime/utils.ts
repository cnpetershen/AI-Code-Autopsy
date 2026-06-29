import { JSXElementInfo, UIFile } from '../ast/types.js';

export function uIFileToElements(uiFile: UIFile): JSXElementInfo[] {
  return uiFile.elements;
}

export function deduplicateFindings(findings: any[]): any[] {
  const seen = new Set<string>();
  return findings.filter(f => {
    const key = `${f.id}-${f.element?.tagName}-${f.element?.depth}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortFindingsBySeverity(findings: any[]): any[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...findings].sort(
    (a, b) => (severityOrder[a.severity as keyof typeof severityOrder] || 99) -
      (severityOrder[b.severity as keyof typeof severityOrder] || 99)
  );
}
