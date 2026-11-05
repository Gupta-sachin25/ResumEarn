import { BaseJobSource } from './BaseJobSource.js';
import { prisma } from '../../db/prisma.js';

export class DatabaseJobSource extends BaseJobSource {
  constructor() {
    super('DatabaseJobSource');
  }

  async search(profile, query = '') {
    try {
      const whereClause = {
        isActive: true,
        verificationStatus: 'VERIFIED'
      };

      if (query && query.trim()) {
        const q = query.trim();
        whereClause.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { skills: { hasSome: [q] } }
        ];
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return jobs;
    } catch (err) {
      console.error('DatabaseJobSource search error:', err);
      return [];
    }
  }
}

