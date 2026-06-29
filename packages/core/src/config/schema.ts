import { PresetLevel, Finding, JSXElementInfo, AntiAIConfig, RuleConfig, DetectorConfig } from '../ast/types';

export const DEFAULT_CONFIG: AntiAIConfig = {
  preset: 'balanced',
  detectors: [
    { id: 'layout-detector', enabled: true, rules: [] },
    { id: 'ai-pattern-detector', enabled: true, rules: [] },
    { id: 'tailwind-detector', enabled: true, rules: [] },
    { id: 'heuristic-rules', enabled: true, rules: [] },
  ],
  ignorePaths: ['node_modules', 'dist', '.next', 'build'],
  maxFindings: 50,
  outputFormat: 'pretty',
  autoFix: false,
  guardrails: true,
};

export function mergeConfig(userConfig: Partial<AntiAIConfig>): AntiAIConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    detectors: userConfig.detectors || DEFAULT_CONFIG.detectors,
    ignorePaths: userConfig.ignorePaths || DEFAULT_CONFIG.ignorePaths,
  };
}

export type { AntiAIConfig, RuleConfig, DetectorConfig };
