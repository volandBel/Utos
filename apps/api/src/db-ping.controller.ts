import 'dotenv/config';
import { Controller, Get } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('db')
export class DbPingController {
  @Get('ping')
  async ping() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const res = await pool.query('select 1 as ok');
      return { db: res.rows[0]?.ok === 1 ? 'ok' : 'fail' };
    } finally {
      await pool.end();
    }
  }
}
