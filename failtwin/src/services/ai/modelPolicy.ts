import type { ModelTier } from '@/domain/types';

/**
 * Model selection & cost control policy.
 *
 * Cheap vs quality tiers let a real Croche integration route simple
 * classification to a low-cost model and complex reasoning / generation to a
 * higher-quality model — the key LLM-cost lever the hackathon asks for.
 */
export type AITask =
  | 'classify_mistake' // quick classification of errorType — cheap
  | 'analyze_mistake' // full cause analysis + correction — quality
  | 'predict_mistake' // next-mistake prediction — cheap
  | 'generate_trap' // novel trap problem generation — quality
  | 'generate_problem'; // standard problem generation — cheap

export function tierForTask(task: AITask): ModelTier {
  switch (task) {
    case 'analyze_mistake':
    case 'generate_trap':
      return 'quality';
    case 'classify_mistake':
    case 'predict_mistake':
    case 'generate_problem':
      return 'cheap';
    default:
      return 'cheap';
  }
}

export interface ModelConfig {
  cheap: string;
  quality: string;
}

/** Defaults; overridable via env in the real client. These are placeholders —
 *  the real model ids come from your Croche workspace. */
export const DEFAULT_MODELS: ModelConfig = {
  cheap: process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP || 'croche-cheap-default',
  quality: process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY || 'croche-quality-default',
};

export function modelForTask(task: AITask, cfg: ModelConfig = DEFAULT_MODELS): string {
  return tierForTask(task) === 'quality' ? cfg.quality : cfg.cheap;
}
