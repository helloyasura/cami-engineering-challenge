import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRequest } from './customer-request.entity';
import { RequestNote } from './request-note.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { KeywordClassifier } from './keyword-classifier';
import { ClassificationHistory } from './classification-history.entity';
import { CLASSIFICATION_PROVIDER } from './shared/classification.types';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerRequest, RequestNote, ClassificationHistory])],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    KeywordClassifier,
    { provide: CLASSIFICATION_PROVIDER, useExisting: KeywordClassifier },
  ],
})
export class RequestsModule {}
