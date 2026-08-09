import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestStatus } from './customer-request.entity';
import { ClassifyRequestPayload } from './shared/classification.types';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  list() {
    return this.requestsService.list();
  }

  @Get('history')
  history(@Query('category') category?: string) {
    return this.requestsService.getHistory(category);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.requestsService.getById(id);
  }

  @Post()
  create(@Body() body: { message?: string }) {
    return this.requestsService.createRequest(body?.message ?? '');
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status?: RequestStatus }) {
    return this.requestsService.updateStatus(id, body.status as RequestStatus);
  }

  @Post('classify')
  async classify(@Body() body: ClassifyRequestPayload) {
    return this.requestsService.classifyRequest(body.message, body.requestId);
  }
}
