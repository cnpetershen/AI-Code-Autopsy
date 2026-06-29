export { AntiAIRuntime } from './runtime/AntiAIRuntime.js';
export { AnalysisContext } from './runtime/Context.js';
export { Pipeline } from './runtime/Pipeline.js';
export type { DetectorPlugin } from './runtime/Pipeline.js';

export { parseUI } from './ast/parser.js';
export { traverseElements, queryElements, findParent, findChildren } from './ast/traverse.js';
export { ASTQueryBuilder, $q, query } from './ast/query.js';
export type { ASTQuery } from './ast/query.js';

export { detectLayoutPatterns, getLayoutPatterns } from './detectors/layoutDetector.js';
export { detectAIClassPatterns } from './detectors/tailwindDetector.js';
export { detectAIPatterns, getAIPatternRules } from './detectors/aiPatternDetector.js';
export { detectHeuristics, getHeuristicRules } from './detectors/heuristicRules.js';

export { transformClasses } from './transformers/classTransformer.js';
export { transformLayout } from './transformers/layoutTransformer.js';
export { fixSemanticHTML } from './transformers/semanticFixer.js';
export { applyGuardrails } from './transformers/guardrails.js';

export { computeMetrics } from './analyzer/metrics.js';
export { computeScore, classifyAIScore } from './analyzer/score.js';
export { generateExplanations, formatExplainSummary } from './analyzer/explain.js';

export { DEFAULT_CONFIG, mergeConfig } from './config/schema.js';
export { getPreset, PRESETS } from './config/presets.js';

export { tokenizeTailwind, classifyClassTokenDensity } from './utils/tailwindTokens.js';

export type {
  UIFile, JSXElementInfo, JSXAttributeInfo, JSXChildInfo,
  Finding, TransformSuggestion, AnalysisResult, ExplainEntry,
  UIMetrics, TransformResult, DetectorResult,
  PresetLevel, AntiAIConfig, RuleConfig, DetectorConfig,
} from './ast/types.js';
