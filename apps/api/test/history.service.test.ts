import { describe, expect, it, vi } from 'vitest';
import { RequestsService } from '../src/requests/requests.service';
import { ClassificationProvider } from '../src/requests/shared/classification.types';

function createService(provider: ClassificationProvider) {
  const requestsRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const notesRepo = {
    find: vi.fn(),
  };

  const historyRepo = {
    save: vi.fn(),
    create: vi.fn(),
    createQueryBuilder: vi.fn(() => ({
      orderBy: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    })),
  };

  const service = new RequestsService(requestsRepo as any, notesRepo as any, historyRepo as any, provider);
  return { service, historyRepo };
}

describe('RequestsService history', () => {
  it('persists a classification entry for the history list', async () => {
    const provider: ClassificationProvider = {
      classify: vi.fn().mockReturnValue({ category: 'billing', confidence: 0.91 }),
    };
    const { service, historyRepo } = createService(provider);

    const saveSpy = vi.spyOn(historyRepo, 'save');
    historyRepo.create.mockReturnValue({ message: 'invoice issue', category: 'billing', confidence: 0.91, requestId: null });

    await service.classifyRequest('invoice issue');

    expect(saveSpy).toHaveBeenCalled();
  });
});
