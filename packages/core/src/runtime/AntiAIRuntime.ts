import { AnalysisContext } from './Context.js';
import { Pipeline, DetectorPlugin } from './Pipeline.js';
import { AnalysisResult, TransformResult, AntiAIConfig } from '../ast/types.js';
import { DEFAULT_CONFIG } from '../config/schema.js';
import { getPreset } from '../config/presets.js';
import { detectLayoutPatterns } from '../detectors/layoutDetector.js';
import { detectAIClassPatterns } from '../detectors/tailwindDetector.js';
import { detectAIPatterns } from '../detectors/aiPatternDetector.js';
import { detectHeuristics } from '../detectors/heuristicRules.js';

export interface ScanResult {
  analysis: AnalysisResult;
  elapsed: number;
}

export interface FixResult {
  analysis: AnalysisResult;
  transform: TransformResult | null;
  elapsed: number;
}

export class AntiAIRuntime {
  private config: AntiAIConfig;
  private static initialized = false;

  constructor(config?: Partial<AntiAIConfig>) {
    this.config = config ? { ...DEFAULT_CONFIG, ...config } : DEFAULT_CONFIG;
    this.ensurePluginsRegistered();
  }

  private ensurePluginsRegistered(): void {
    if (AntiAIRuntime.initialized) return;
    AntiAIRuntime.initialized = true;

    const builtinPlugins: DetectorPlugin[] = [
      {
        id: 'layout-detector',
        name: 'Layout Pattern Detector',
        enabled: true,
        detect: (elements) => detectLayoutPatterns(elements),
      },
      {
        id: 'ai-pattern-detector',
        name: 'AI Pattern Detector',
        enabled: true,
        detect: (elements, source) => detectAIPatterns(elements, source),
      },
      {
        id: 'tailwind-detector',
        name: 'Tailwind Class Detector',
        enabled: true,
        detect: (elements) => detectAIClassPatterns(elements),
      },
      {
        id: 'heuristic-rules',
        name: 'Heuristic Rule Engine',
        enabled: true,
        detect: (elements) => detectHeuristics(elements),
      },
    ];

    for (const plugin of builtinPlugins) {
      Pipeline.registerPlugin(plugin);
    }
  }

  static registerPlugin(plugin: DetectorPlugin): void {
    Pipeline.registerPlugin(plugin);
  }

  setPreset(presetName: string): void {
    this.config = getPreset(presetName);
  }

  setConfig(config: Partial<AntiAIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AntiAIConfig {
    return { ...this.config };
  }

  async scan(source: string): Promise<ScanResult> {
    const context = AnalysisContext.create(source, this.config);
    const pipeline = new Pipeline(context);
    const analysis = await pipeline.run();

    return {
      analysis,
      elapsed: context.elapsed,
    };
  }

  async fix(source: string): Promise<FixResult> {
    const fixConfig = { ...this.config, autoFix: true };
    const context = AnalysisContext.create(source, fixConfig);
    const pipeline = new Pipeline(context);
    const { analysis, transform } = await pipeline.runWithTransform();

    return {
      analysis,
      transform,
      elapsed: context.elapsed,
    };
  }

  async explain(source: string): Promise<{
    analysis: AnalysisResult;
    summary: string;
    elapsed: number;
  }> {
    const result = await this.scan(source);
    return {
      analysis: result.analysis,
      summary: result.analysis.summary,
      elapsed: result.elapsed,
    };
  }
}
