import { IsUUID, IsString, MinLength, IsObject } from 'class-validator';

export class CreateTestDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsObject()
  dsl!: unknown; // валидируем по Zod в сервисе
}
