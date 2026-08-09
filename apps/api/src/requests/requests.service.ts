import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from './customer-request.entity';
import { RequestNote } from './request-note.entity';

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
  ) {}

  /// method header not been added cannot read what functionalities should be there 
  async list(): Promise<RequestListItem[]> {
    /// item validation need to be done in the controller, not here. This is a service layer and should not be concerned with validation.
    const rows = await this.requests.find({
      order: { createdAt: 'DESC' },
    });
    ///N +1 parttern is being used here, which is not efficient. Instead,
    ///  we should use a single query with a join to fetch the notes along with the requests.

    const items: RequestListItem[] = [];
    for (const row of rows) {
      const notes = await this.notes.find({
        where: { requestId: row.id },
        order: { createdAt: 'DESC' },
      });
      row.notes = notes;

      items.push({
        id: row.id,
        message: row.message,
        status: row.status,
        category: row.category,
        confidence: row.confidence,
        noteCount: notes.length,
        latestNotePreview: notes[0]?.body ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      });
    }

    return items;
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
    const row = this.requests.create({
      message,
      status: 'open',
      category: null,
      confidence: null,
    });
    return this.requests.save(row);
  }

  async save(request: CustomerRequest): Promise<CustomerRequest> {
    return this.requests.save(request);
  }
}
