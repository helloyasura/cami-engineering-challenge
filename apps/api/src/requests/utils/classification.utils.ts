import { ClassificationCategory, ClassificationResult } from '../shared/classification.types';

export function softenClassification(result: ClassificationResult, message: string): ClassificationResult {
  const trimmed = message.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length < 3 && result.category !== 'unknown') {
    return {
      category: result.category,
      confidence: Math.max(0.5, result.confidence - 0.15),
    };
  }

  return result;
}

export function normalizeClassificationResult(
  result: ClassificationResult,
  message: string,
): ClassificationResult {
  const softened = softenClassification(result, message);

  if (softened.confidence < 0.55) {
    return { category: 'unknown', confidence: softened.confidence };
  }

  return softened;
}

export function isValidClassificationMessage(message: string): message is string {
  return typeof message === 'string' && message.trim().length > 0 && message.length <= 2000;
}

export function toClassificationCategory(value: string): ClassificationCategory {
  if (value === 'support' || value === 'sales' || value === 'billing' || value === 'unknown') {
    return value;
  }

  return 'unknown';
}
