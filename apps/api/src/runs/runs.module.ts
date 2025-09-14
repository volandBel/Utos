import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { ProjectsModule } from '../projects/projects.module';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  imports: [DatabaseModule, ProjectsModule],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
