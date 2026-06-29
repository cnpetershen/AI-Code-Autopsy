import { AnalysisContext } from './Context.js';
import { Finding, DetectorResult, AnalysisResult, TransformResult } from '../ast/types.js';
import { computeMetrics } from '../analyzer/metrics.js';
import { computeScore } from '../analyzer/score.js';
import { generateExplanations, formatExplainSummary } from '../analyzer/explain.js';
import { applyGuardrails } from '../transformers/guardrails.js';
import { transformClasses } from '../transformers/classTransformer.js';
import { transformLayout } from '../transformers/layoutTransformer.js';
import { fixSemanticHTML } from '../transformers/semanticFixer.js';
import { deduplicateFindings, sortFindingsBySeverity } from './utils.js';

export type PipelineStage =
  | 'parse'
  | 'analyze-structure'
  | 'detect'
  | 'score'
  | 'explain'
  | 'transform'
  | 'complete'
  | 'error';

export interface DetectorPlugin {
  id: string;
  name: string;
  enabled: boolean;
  detect: (elements: any[], source: string, context: AnalysisContext) => DetectorResult;
}

export class Pipeline {
  private stages: PipelineStage[] = [];
  private context: AnalysisContext;
  private static plugins: Map<string, DetectorPlugin> = new Map();

  constructor(context: AnalysisContext) {
    this.context = context;
  }

  static registerPlugin(plugin: DetectorPlugin): void {
    Pipeline.plugins.set(plugin.id, plugin);
  }

  static unregisterPlugin(id: string): void {
    Pipeline.plugins.delete(id);
  }

  static getPlugins(): DetectorPlugin[] {
    return Array.from(Pipeline.plugins.values());
  }

  get currentStage(): PipelineStage {
    return this.stages[this.stages.length - 1] || 'parse';
  }

  async run(): Promise<AnalysisResult> {
    try {
      this.stages.push('parse');
      if (this.context.hasErrors()) {
        throw new Error(`Parse errors: ${this.context.getErrors().join(', ')}`);
      }

      this.stages.push('analyze-structure');
      const metrics = computeMetrics(this.context.elements);
      this.context.metrics = metrics;

      this.stages.push('detect');
      const findings = await this.runDetectors();
      this.context.findings = deduplicateFindings(sortFindingsBySeverity(findings));

      this.stages.push('score');
      const scoreResult = computeScore(
        this.context.findings,
        metrics,
        this.context.config.preset
      );

      this.stages.push('explain');
      const explanations = generateExplanations(
        this.context.findings,
        scoreResult,
        metrics
      );

      const result: AnalysisResult = {
        score: scoreResult.totalScore,
        findings: this.context.findings,
        explanations,
        metrics,
        summary: formatExplainSummary(this.context.findings, explanations, metrics),
      };

      this.context.result = result;
      this.stages.push('complete');

      return result;
    } catch (err) {
      this.stages.push('error');
      throw err;
    }
  }

  async runWithTransform(): Promise<{
    analysis: AnalysisResult;
    transform: TransformResult | null;
  }> {
    const analysis = await this.run();

    if (!this.context.config.autoFix || analysis.score < 0.3) {
      return { analysis, transform: null };
    }

    this.stages.push('transform');
    let code = this.context.source;

    const classResult = transformClasses(code, this.context.findings);
    code = classResult.code;

    const layoutResult = transformLayout(code, this.context.findings);
    code = layoutResult.code;

    const semanticResult = fixSemanticHTML(
      code,
      this.context.elements,
      this.context.findings
    );
    code = semanticResult.code;

    let guardrailViolations: string[] = [];
    if (this.context.config.guardrails) {
      guardrailViolations = applyGuardrails(
        this.context.source,
        code,
        this.context.findings
      );
    }

    const transform: TransformResult = {
      success: code !== this.context.source,
      code: code !== this.context.source ? code : this.context.source,
      changes: [
        ...classResult.changes,
        ...layoutResult.changes,
        ...semanticResult.changes,
      ],
      guardrailViolations,
    };

    return { analysis, transform };
  }

  private async runDetectors(): Promise<Finding[]> {
    const allFindings: Finding[] = [];
    const { elements } = this.context;
    const enabledDetectors = this.context.config.detectors.filter((d: any) => d.enabled);

    for (const detector of enabledDetectors) {
      const plugin = Pipeline.plugins.get(detector.id);
      if (!plugin || !plugin.enabled) continue;

      const result: DetectorResult = plugin.detect(elements, this.context.source, this.context);

      for (const finding of result.findings) {
        const ruleConfig = detector.rules?.find((r: any) => r.id === finding.id);
        if (ruleConfig && !ruleConfig.enabled) continue;

        allFindings.push({
          ...finding,
          severity: ruleConfig?.severity || finding.severity,
        });
      }
    }

    return allFindings;
  }
}
