import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateProjectDto) {
    const ownerId: string = req.user.sub; // берём из access-токена
    const p = await this.service.create(dto.name, ownerId);
    return { id: p.id, name: p.name, created_at: p.createdAt };
  }

  @Get()
  async list(@Req() req: any) {
    const ownerId: string = req.user.sub;
    const rows = await this.service.list(ownerId);
    return rows.map((p) => ({ id: p.id, name: p.name, created_at: p.createdAt }));
  }
}
