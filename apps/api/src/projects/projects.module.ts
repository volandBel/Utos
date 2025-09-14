import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService], // ← ОБЯЗАТЕЛЬНО экспортируем провайдер
})
export class ProjectsModule {}
