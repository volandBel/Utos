import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { ProjectsModule } from '../projects/projects.module'; // ← импортируем модуль проектов
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [DatabaseModule, ProjectsModule], // ← ОБЯЗАТЕЛЬНО
  controllers: [TestsController],
  providers: [TestsService],
})
export class TestsModule {}
