import type { Node, JSXElement, JSXFragment, JSXText, JSXExpressionContainer, JSXAttribute, JSXSpreadAttribute } from '@babel/types';

export type ASTNode = Node;

export interface JSXElementInfo {
  node: JSXElement;
  tagName: string;
  attributes: JSXAttributeInfo[];
  className?: string;
  children: JSXChildInfo[];
  depth: number;
  parent?: JSXElementInfo;
}

export interface JSXAttributeInfo {
  name: string;
  value: string | boolean | number | null;
  node: JSXAttribute | JSXSpreadAttribute;
}

export interface JSXChildInfo {
  type: 'element' | 'text' | 'expression' | 'fragment' | 'spread';
  node: ASTNode;
  element?: JSXElementInfo;
  text?: string;
}

export interface UIFile {
  ast: ASTNode;
  source: string;
  elements: JSXElementInfo[];
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

export interface ASTQuery {
  tag?: string | RegExp;
  hasClass?: string | RegExp;
  hasAttribute?: string | RegExp;
  depth?: { min?: number; max?: number };
  parentTag?: string | RegExp;
  childCount?: { min?: number; max?: number };
  hasText?: string | RegExp;
}

export interface Finding {
  id: string;
  detectorId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  explanation: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  element: JSXElementInfo;
  score: number;
  fix?: TransformSuggestion;
  tags: string[];
}

export interface TransformSuggestion {
  type: 'replace-class' | 'wrap-element' | 'remove-element' | 'restructure' | 'modify-attribute';
  description: string;
  transform: (source: string) => string;
}

export interface AnalysisResult {
  score: number;
  findings: Finding[];
  explanations: ExplainEntry[];
  metrics: UIMetrics;
  summary: string;
}

export interface ExplainEntry {
  category: string;
  message: string;
  impact: number;
  suggestion: string;
}

export interface UIMetrics {
  elementCount: number;
  uniqueTagCount: number;
  maxDepth: number;
  averageDepth: number;
  gridStructures: number;
  cardLikeElements: number;
  symmetryScore: number;
  repetitionScore: number;
  classTokenDensity: number;
  structuralEntropy: number;
}

export interface TransformResult {
  success: boolean;
  code: string;
  changes: string[];
  guardrailViolations: string[];
}

export interface DetectorResult {
  detectorId: string;
  findings: Finding[];
}

export type PresetLevel = 'strict' | 'balanced' | 'experimental';

export interface AntiAIConfig {
  preset: PresetLevel;
  detectors: DetectorConfig[];
  ignorePaths: string[];
  maxFindings: number;
  outputFormat: 'pretty' | 'json' | 'minimal';
  autoFix: boolean;
  guardrails: boolean;
}

export interface RuleConfig {
  id: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  options?: Record<string, any>;
}

export interface DetectorConfig {
  id: string;
  enabled: boolean;
  rules: RuleConfig[];
}
