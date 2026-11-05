import { BaseJobSource } from './BaseJobSource.js';
import { prisma } from '../../db/prisma.js';

export class UserSubmittedJobSource extends BaseJobSource {
  constructor() {
    super('UserSubmittedJobSource');
  }

  async search(profile, query = '') {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          sourceType: 'USER',
          isActive: true,
          verificationStatus: 'VERIFIED'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      return jobs;
    } catch (err) {
      console.error('UserSubmittedJobSource search error:', err);
      return [];
    }
  }
}

