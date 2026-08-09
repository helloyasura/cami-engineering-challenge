export type ClassificationCategory = 'support' | 'sales' | 'billing' | 'unknown';

export type ClassificationResult = {
  category: ClassificationCategory;
  confidence: number;
};

export const CLASSIFICATION_PROVIDER = 'CLASSIFICATION_PROVIDER';

export type ClassificationProvider = {
  classify(message: string): ClassificationResult;
};

export type ClassifyRequestPayload = {
  message: string;
  requestId?: string;
};

export type ClassifyResponse = {
  category: ClassificationCategory;
  confidence: number;
  requestId: string | null;
};
