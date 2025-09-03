import { Module } from '@nestjs/common';
import { db, pool } from './db';

@Module({
  providers: [
    { provide: 'PG_POOL', useValue: pool },
    { provide: 'DB', useValue: db },
  ],
  exports: ['PG_POOL', 'DB'],
})
export class DatabaseModule {}
