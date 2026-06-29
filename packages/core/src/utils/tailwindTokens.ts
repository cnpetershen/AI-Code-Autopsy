export interface TailwindClassToken {
  raw: string;
  category: string;
  subcategory: string;
  value: string;
}

export function tokenizeTailwind(className: string): TailwindClassToken[] {
  const tokens: TailwindClassToken[] = [];
  const parts = className.trim().split(/\s+/);

  for (const part of parts) {
    if (!part) continue;
    const token = parseTailwindToken(part);
    if (token) tokens.push(token);
  }
  return tokens;
}

function parseTailwindToken(raw: string): TailwindClassToken | null {
  const variants = raw.split(':');
  const base = variants[variants.length - 1];

  const patternDefs: { re: RegExp; cat: string; sub: string }[] = [
    { re: /^([mp][trblxy]?)-(0\.5|[0-9]+(\/[0-9]+)?)$/, cat: 'spacing', sub: 'padding-margin' },
    { re: /^(w|h|min-w|min-h|max-w|max-h)-(.+)$/, cat: 'sizing', sub: 'dimension' },
    { re: /^(bg|text|border|ring)-(gray|red|blue|green|yellow|indigo|purple|pink|teal|cyan|orange|amber|lime|emerald|rose|sky|violet|fuchsia|stone|neutral|zinc|slate)-(\d+)$/, cat: 'color', sub: 'utility' },
    { re: /^(rounded)-(sm|md|lg|xl|2xl|3xl|full|none)$/, cat: 'border-radius', sub: 'shape' },
    { re: /^(shadow)-(sm|md|lg|xl|2xl|inner|none)$/, cat: 'shadow', sub: 'elevation' },
    { re: /^(flex|grid|inline|table|hidden|block|inline-block|inline-flex)/, cat: 'display', sub: 'layout' },
    { re: /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline|auto)$/, cat: 'alignment', sub: 'layout' },
    { re: /^(gap|space)-[xy]?-/, cat: 'spacing', sub: 'gap' },
    { re: /^(p|m|px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml)-/, cat: 'spacing', sub: 'padding-margin' },
  ];

  for (const p of patternDefs) {
    if (p.re.test(base)) {
      return { raw, category: p.cat, subcategory: p.sub, value: base };
    }
  }
  return { raw, category: 'other', subcategory: 'unknown', value: base };
}

export function classifyClassTokenDensity(elements: any[]): {
  totalTokens: number;
  averageTokensPerElement: number;
  aiTokenCount: number;
} {
  const AI_TOKEN_SIGNATURES: { pattern: RegExp; weight: number }[] = [
    { pattern: /backdrop-blur/, weight: 0.9 },
    { pattern: /bg-gradient-to-[brtrbl]/, weight: 0.7 },
    { pattern: /shadow-(xl|2xl)/, weight: 0.6 },
    { pattern: /rounded-(2xl|3xl)/, weight: 0.5 },
    { pattern: /hover:-translate-y/, weight: 0.5 },
    { pattern: /transition-all/, weight: 0.4 },
    { pattern: /duration-\d+/, weight: 0.3 },
    { pattern: /backdrop-filter/, weight: 0.8 },
    { pattern: /bg-opacity-\d+/, weight: 0.4 },
    { pattern: /text-gradient/, weight: 0.6 },
    { pattern: /animate-(pulse|bounce|spin)/, weight: 0.5 },
  ];

  let totalTokens = 0;
  let aiTokenCount = 0;
  let elementsWithClass = 0;

  for (const el of elements) {
    if (!el.className) continue;
    elementsWithClass++;
    const tokens = tokenizeTailwind(el.className);
    totalTokens += tokens.length;

    for (const sig of AI_TOKEN_SIGNATURES) {
      aiTokenCount += tokens.filter(t => sig.pattern.test(t.raw)).length;
    }
  }

  return {
    totalTokens,
    averageTokensPerElement: elementsWithClass > 0 ? totalTokens / elementsWithClass : 0,
    aiTokenCount,
  };
}
