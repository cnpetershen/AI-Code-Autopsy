import { AntiAIConfig } from './schema';

export const PRESETS: Record<string, AntiAIConfig> = {
  strict: {
    preset: 'strict',
    detectors: [
      {
        id: 'layout-detector',
        enabled: true,
        rules: [
          { id: 'symmetrical-3-column-grid', enabled: true, severity: 'critical' },
          { id: 'excessive-symmetry', enabled: true, severity: 'high' },
          { id: 'card-farm', enabled: true, severity: 'critical' },
          { id: 'container-soup', enabled: true, severity: 'medium' },
        ],
      },
      {
        id: 'ai-pattern-detector',
        enabled: true,
        rules: [
          { id: 'hero-section-stack', enabled: true, severity: 'critical' },
          { id: 'feature-section-grid', enabled: true, severity: 'high' },
          { id: 'testimonial-card', enabled: true, severity: 'high' },
          { id: 'footer-stack', enabled: true, severity: 'medium' },
          { id: 'pricing-cards', enabled: true, severity: 'critical' },
        ],
      },
      {
        id: 'tailwind-detector',
        enabled: true,
        rules: [],
      },
      {
        id: 'heuristic-rules',
        enabled: true,
        rules: [
          { id: 'repetitive-text-content', enabled: true, severity: 'high' },
          { id: 'icon-every-card', enabled: true, severity: 'high' },
          { id: 'over-engineered-classnames', enabled: true, severity: 'medium' },
          { id: 'ai-comment-signature', enabled: true, severity: 'low' },
          { id: 'no-semantic-html', enabled: true, severity: 'high' },
        ],
      },
    ],
    ignorePaths: ['node_modules', 'dist', '.next', 'build'],
    maxFindings: 100,
    outputFormat: 'json',
    autoFix: true,
    guardrails: true,
  },
  balanced: {
    preset: 'balanced',
    detectors: [
      {
        id: 'layout-detector',
        enabled: true,
        rules: [
          { id: 'symmetrical-3-column-grid', enabled: true, severity: 'high' },
          { id: 'excessive-symmetry', enabled: true, severity: 'medium' },
          { id: 'card-farm', enabled: true, severity: 'high' },
          { id: 'container-soup', enabled: true, severity: 'low' },
        ],
      },
      {
        id: 'ai-pattern-detector',
        enabled: true,
        rules: [
          { id: 'hero-section-stack', enabled: true, severity: 'high' },
          { id: 'feature-section-grid', enabled: true, severity: 'high' },
          { id: 'testimonial-card', enabled: true, severity: 'medium' },
          { id: 'footer-stack', enabled: true, severity: 'low' },
          { id: 'pricing-cards', enabled: true, severity: 'high' },
        ],
      },
      {
        id: 'tailwind-detector',
        enabled: true,
        rules: [],
      },
      {
        id: 'heuristic-rules',
        enabled: true,
        rules: [
          { id: 'repetitive-text-content', enabled: true, severity: 'medium' },
          { id: 'icon-every-card', enabled: true, severity: 'high' },
          { id: 'over-engineered-classnames', enabled: true, severity: 'low' },
          { id: 'ai-comment-signature', enabled: false, severity: 'low' },
          { id: 'no-semantic-html', enabled: true, severity: 'medium' },
        ],
      },
    ],
    ignorePaths: ['node_modules', 'dist', '.next', 'build'],
    maxFindings: 50,
    outputFormat: 'pretty',
    autoFix: false,
    guardrails: true,
  },
  experimental: {
    preset: 'experimental',
    detectors: [
      {
        id: 'layout-detector',
        enabled: true,
        rules: [
          { id: 'symmetrical-3-column-grid', enabled: true, severity: 'medium' },
          { id: 'excessive-symmetry', enabled: true, severity: 'low' },
          { id: 'card-farm', enabled: true, severity: 'medium' },
          { id: 'container-soup', enabled: true, severity: 'low' },
        ],
      },
      {
        id: 'ai-pattern-detector',
        enabled: true,
        rules: [
          { id: 'hero-section-stack', enabled: true, severity: 'medium' },
          { id: 'feature-section-grid', enabled: true, severity: 'medium' },
          { id: 'testimonial-card', enabled: true, severity: 'low' },
          { id: 'footer-stack', enabled: true, severity: 'low' },
          { id: 'pricing-cards', enabled: true, severity: 'medium' },
        ],
      },
      {
        id: 'tailwind-detector',
        enabled: true,
        rules: [],
      },
      {
        id: 'heuristic-rules',
        enabled: true,
        rules: [
          { id: 'repetitive-text-content', enabled: true, severity: 'low' },
          { id: 'icon-every-card', enabled: true, severity: 'medium' },
          { id: 'over-engineered-classnames', enabled: true, severity: 'low' },
          { id: 'ai-comment-signature', enabled: true, severity: 'low' },
          { id: 'no-semantic-html', enabled: true, severity: 'low' },
        ],
      },
    ],
    ignorePaths: ['node_modules', 'dist', '.next', 'build'],
    maxFindings: 20,
    outputFormat: 'pretty',
    autoFix: false,
    guardrails: false,
  },
};

export function getPreset(presetName: string): AntiAIConfig {
  return PRESETS[presetName] || PRESETS.balanced;
}
