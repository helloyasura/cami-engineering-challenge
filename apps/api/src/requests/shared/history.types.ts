export type ClassificationHistoryItem = {
  id: string;
  message: string;
  category: string;
  confidence: number;
  requestId: string | null;
  createdAt: string;
};

export type ClassificationHistoryResponse = {
  items: ClassificationHistoryItem[];
};
