import { Finding, UIMetrics, PresetLevel } from '../ast/types';

interface ScoreWeights {
  layoutPatterns: number;
  aiPatterns: number;
  tailwindTokens: number;
  heuristics: number;
  metrics: {
    symmetry: number;
    repetition: number;
    density: number;
    entropy: number;
  };
}

const PRESET_WEIGHTS: Record<PresetLevel, ScoreWeights> = {
  strict: {
    layoutPatterns: 0.30,
    aiPatterns: 0.30,
    tailwindTokens: 0.20,
    heuristics: 0.20,
    metrics: {
      symmetry: 0.25,
      repetition: 0.35,
      density: 0.20,
      entropy: 0.20,
    },
  },
  balanced: {
    layoutPatterns: 0.25,
    aiPatterns: 0.25,
    tailwindTokens: 0.25,
    heuristics: 0.25,
    metrics: {
      symmetry: 0.25,
      repetition: 0.30,
      density: 0.20,
      entropy: 0.25,
    },
  },
  experimental: {
    layoutPatterns: 0.20,
    aiPatterns: 0.20,
    tailwindTokens: 0.30,
    heuristics: 0.30,
    metrics: {
      symmetry: 0.20,
      repetition: 0.25,
      density: 0.30,
      entropy: 0.25,
    },
  },
};

export interface ScoreResult {
  totalScore: number;
  categoryScores: {
    layoutPatterns: number;
    aiPatterns: number;
    tailwindTokens: number;
    heuristics: number;
    structuralMetrics: number;
  };
  details: {
    findingScores: { id: string; score: number; severity: string }[];
    metricScores: Record<string, number>;
  };
}

export function computeScore(
  findings: Finding[],
  metrics: UIMetrics,
  preset: PresetLevel = 'balanced'
): ScoreResult {
  const weights = PRESET_WEIGHTS[preset];

  const layoutFindings = findings.filter(f => f.detectorId === 'layout-detector');
  const aiFindings = findings.filter(f => f.detectorId === 'ai-pattern-detector');
  const tailwindFindings = findings.filter(f => f.detectorId === 'tailwind-detector');
  const heuristicFindings = findings.filter(f => f.detectorId === 'heuristic-rules');

  const layoutScore = aggregateFindingScores(layoutFindings);
  const aiPatternScore = aggregateFindingScores(aiFindings);
  const tailwindScore = aggregateFindingScores(tailwindFindings);
  const heuristicScore = aggregateFindingScores(heuristicFindings);

  const symmetryMetric = metrics.symmetryScore;
  const repetitionMetric = metrics.repetitionScore;
  const densityMetric = Math.min(metrics.classTokenDensity / 8, 1);
  const entropyMetric = 1 - metrics.structuralEntropy;

  const structuralScore =
    (symmetryMetric * weights.metrics.symmetry) +
    (repetitionMetric * weights.metrics.repetition) +
    (densityMetric * weights.metrics.density) +
    (entropyMetric * weights.metrics.entropy);

  const totalScore =
    (layoutScore * weights.layoutPatterns) +
    (aiPatternScore * weights.aiPatterns) +
    (tailwindScore * weights.tailwindTokens) +
    (heuristicScore * weights.heuristics) +
    (structuralScore * 0.1);

  const findingScores = findings.map(f => ({
    id: f.id,
    score: f.score,
    severity: f.severity,
  }));

  return {
    totalScore: Math.min(Math.max(totalScore, 0), 1),
    categoryScores: {
      layoutPatterns: layoutScore,
      aiPatterns: aiPatternScore,
      tailwindTokens: tailwindScore,
      heuristics: heuristicScore,
      structuralMetrics: structuralScore,
    },
    details: {
      findingScores,
      metricScores: {
        symmetry: symmetryMetric,
        repetition: repetitionMetric,
        density: densityMetric,
        entropy: entropyMetric,
      },
    },
  };
}

function aggregateFindingScores(findings: Finding[]): number {
  if (findings.length === 0) return 0;
  const total = findings.reduce((s, f) => s + f.score, 0);
  const avg = total / findings.length;
  const severityMultiplier = Math.log2(findings.length + 1) / 3;
  return Math.min(avg * (1 + severityMultiplier * 0.5), 1);
}

export function classifyAIScore(score: number): {
  level: 'human-like' | 'mostly-human' | 'hybrid' | 'mostly-ai' | 'ai-template';
  label: string;
  color: string;
  description: string;
} {
  if (score < 0.2) {
    return {
      level: 'human-like',
      label: 'Human-Like',
      color: 'green',
      description: 'This UI looks naturally designed by a human. Minimal AI generation patterns detected.',
    };
  }
  if (score < 0.4) {
    return {
      level: 'mostly-human',
      label: 'Mostly Human',
      color: 'teal',
      description: 'Minor AI patterns detected. The structure is largely human-like.',
    };
  }
  if (score < 0.6) {
    return {
      level: 'hybrid',
      label: 'Hybrid',
      color: 'yellow',
      description: 'Mixed signals. Some parts look AI-generated, others appear human-designed.',
    };
  }
  if (score < 0.8) {
    return {
      level: 'mostly-ai',
      label: 'Mostly AI',
      color: 'orange',
      description: 'Strong AI generation patterns detected. Significant template-like structures present.',
    };
  }
  return {
    level: 'ai-template',
    label: 'AI Template',
    color: 'red',
    description: 'Highly likely AI-generated. Multiple template patterns and AI styling signatures detected.',
  };
}
