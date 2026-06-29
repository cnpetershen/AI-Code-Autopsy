import { UIFile, JSXElementInfo, Finding, AnalysisResult, UIMetrics, AntiAIConfig } from '../ast/types.js';
import { parseUI } from '../ast/parser.js';
import { uIFileToElements } from './utils.js';

export class AnalysisContext {
  readonly source: string;
  readonly uiFile: UIFile;
  readonly elements: JSXElementInfo[];
  readonly config: AntiAIConfig;
  readonly startTime: number;

  findings: Finding[];
  metrics: UIMetrics | null;
  result: AnalysisResult | null;

  private constructor(source: string, config: AntiAIConfig) {
    this.source = source;
    this.config = config;
    this.uiFile = parseUI(source);
    this.elements = this.uiFile.elements;
    this.findings = [];
    this.metrics = null;
    this.result = null;
    this.startTime = Date.now();
  }

  static create(source: string, config: AntiAIConfig): AnalysisContext {
    return new AnalysisContext(source, config);
  }

  get elapsed(): number {
    return Date.now() - this.startTime;
  }

  hasErrors(): boolean {
    return this.uiFile.errors.length > 0;
  }

  getErrors(): string[] {
    return this.uiFile.errors.map(e => e.message);
  }
}
