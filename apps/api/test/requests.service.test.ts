import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { RequestsService } from '../src/requests/requests.service';
import { ClassificationProvider } from '../src/requests/shared/classification.types';
import { CustomerRequest } from '../src/requests/customer-request.entity';

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
  return { service, requestsRepo, notesRepo, historyRepo };
}

describe('RequestsService', () => {
  it('classifies a request and updates the existing entity when requestId is provided', async () => {
    const provider: ClassificationProvider = {
      classify: vi.fn().mockReturnValue({ category: 'billing', confidence: 0.86 }),
    };
    const { service, requestsRepo } = createService(provider);

    const existing = {
      id: 'req-1',
      status: 'open',
      category: null,
      confidence: null,
    } as CustomerRequest;

    requestsRepo.findOne.mockResolvedValue(existing);
    requestsRepo.save.mockImplementation(async (value: CustomerRequest) => value);

    const result = await service.classifyRequest('Please pay my invoice', 'req-1');

    expect(provider.classify).toHaveBeenCalledWith('Please pay my invoice');
    expect(requestsRepo.save).toHaveBeenCalled();
    expect(result).toEqual({
      category: 'billing',
      confidence: 0.86,
      requestId: 'req-1',
    });
    expect(existing.status).toBe('in_progress');
    expect(existing.category).toBe('billing');
    expect(existing.confidence).toBe(0.86);
  });

  it('rejects empty create messages', async () => {
    const provider: ClassificationProvider = {
      classify: vi.fn(),
    };
    const { service } = createService(provider);

    await expect(service.createRequest('   ')).rejects.toBeInstanceOf(BadRequestException);
  });
});
