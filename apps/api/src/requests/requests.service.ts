import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from './customer-request.entity';
import { RequestNote } from './request-note.entity';
import { ClassificationHistory } from './classification-history.entity';
import {
  CLASSIFICATION_PROVIDER,
  ClassificationProvider,
  ClassifyResponse,
} from './shared/classification.types';
import { ClassificationHistoryResponse } from './shared/history.types';
import {
  isValidClassificationMessage,
  normalizeClassificationResult,
} from './utils/classification.utils';

export type RequestListItem = {
  id: string;
  message: string;
  status: RequestStatus;
  category: string | null;
  confidence: number | null;
  noteCount: number;
  latestNotePreview: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(CustomerRequest)
    private readonly requests: Repository<CustomerRequest>,
    @InjectRepository(RequestNote)
    private readonly notes: Repository<RequestNote>,
    @InjectRepository(ClassificationHistory)
    private readonly classificationHistoryRepo: Repository<ClassificationHistory>,
    @Inject(CLASSIFICATION_PROVIDER)
    private readonly classifier: ClassificationProvider,
  ) {}

  async list(): Promise<RequestListItem[]> {
    const rows = await this.requests
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.notes', 'note')
      .orderBy('request.createdAt', 'DESC')
      .addOrderBy('note.createdAt', 'DESC')
      .getMany();

    return rows.map((row: CustomerRequest) => {
      const latestNote = row.notes?.[0];
      return {
        id: row.id,
        message: row.message,
        status: row.status,
        category: row.category,
        confidence: row.confidence,
        noteCount: row.notes?.length ?? 0,
        latestNotePreview: latestNote?.body ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });
  }

  async getById(id: string): Promise<CustomerRequest> {
    const row = await this.requests.findOne({
      where: { id },
      relations: { notes: true },
    });
    if (!row) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    return row;
  }

  async updateStatus(id: string, status: RequestStatus): Promise<CustomerRequest> {
    const row = await this.getById(id);
    row.status = status;
    return this.requests.save(row);
  }

  async create(message: string): Promise<CustomerRequest> {
    if (!isValidClassificationMessage(message)) {
      throw new BadRequestException('message must be a non-empty string');
    }

    const row = this.requests.create({
      message: message.trim(),
      status: 'open',
      category: null,
      confidence: null,
    });
    return this.requests.save(row);
  }

  async createRequest(message: string): Promise<CustomerRequest> {
    return this.create(message);
  }

  async classifyRequest(message: string, requestId?: string): Promise<ClassifyResponse> {
    if (!isValidClassificationMessage(message)) {
      throw new BadRequestException('message must be a non-empty string');
    }

    const normalized = normalizeClassificationResult(
      this.classifier.classify(message.trim()),
      message,
    );

    if (requestId) {
      const existing = await this.getById(requestId);
      existing.category = normalized.category;
      existing.confidence = normalized.confidence;
      if (existing.status === 'open') {
        existing.status = 'in_progress';
      }
      await this.requests.save(existing);
    }

    await this.classificationHistoryRepo.save(
      this.classificationHistoryRepo.create({
        message: message.trim(),
        category: normalized.category,
        confidence: normalized.confidence,
        requestId: requestId ?? null,
      }),
    );

    return {
      category: normalized.category,
      confidence: normalized.confidence,
      requestId: requestId ?? null,
    };
  }

  async getHistory(category?: string): Promise<ClassificationHistoryResponse> {
    const query = this.classificationHistoryRepo
      .createQueryBuilder('entry')
      .orderBy('entry.createdAt', 'DESC');

    if (category) {
      query.where('entry.category = :category', { category });
    }

    const rows = await query.getMany();

    return {
      items: rows.map((row: ClassificationHistory) => ({
        id: row.id,
        message: row.message,
        category: row.category,
        confidence: row.confidence,
        requestId: row.requestId,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async save(request: CustomerRequest): Promise<CustomerRequest> {
    return this.requests.save(request);
  }
}
