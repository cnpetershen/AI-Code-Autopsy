export { AntiAIRuntime } from './runtime/AntiAIRuntime';
export { AnalysisContext } from './runtime/Context';
export { Pipeline } from './runtime/Pipeline';
export type { DetectorPlugin } from './runtime/Pipeline';

export { parseUI } from './ast/parser';
export { traverseElements, queryElements, findParent, findChildren } from './ast/traverse';
export { ASTQueryBuilder, $q, query } from './ast/query';
export type { ASTQuery } from './ast/query';

export { detectLayoutPatterns, getLayoutPatterns } from './detectors/layoutDetector';
export { detectAIClassPatterns } from './detectors/tailwindDetector';
export { detectAIPatterns, getAIPatternRules } from './detectors/aiPatternDetector';
export { detectHeuristics, getHeuristicRules } from './detectors/heuristicRules';

export { transformClasses } from './transformers/classTransformer';
export { transformLayout } from './transformers/layoutTransformer';
export { fixSemanticHTML } from './transformers/semanticFixer';
export { applyGuardrails } from './transformers/guardrails';

export { computeMetrics } from './analyzer/metrics';
export { computeScore, classifyAIScore } from './analyzer/score';
export { generateExplanations, formatExplainSummary } from './analyzer/explain';

export { DEFAULT_CONFIG, mergeConfig } from './config/schema';
export { getPreset, PRESETS } from './config/presets';

export { tokenizeTailwind, classifyClassTokenDensity } from './utils/tailwindTokens';

export type {
  UIFile, JSXElementInfo, JSXAttributeInfo, JSXChildInfo,
  Finding, TransformSuggestion, AnalysisResult, ExplainEntry,
  UIMetrics, TransformResult, DetectorResult,
  PresetLevel, AntiAIConfig, RuleConfig, DetectorConfig,
} from './ast/types';
