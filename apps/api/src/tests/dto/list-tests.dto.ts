import { IsUUID } from 'class-validator';

export class ListTestsQueryDto {
  @IsUUID()
  projectId!: string;
}
