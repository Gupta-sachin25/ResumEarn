import { BaseJobSource } from './BaseJobSource.js';
import { discoverJobsWithGemini } from '../gemini.service.js';

export class GeminiJobSource extends BaseJobSource {
  constructor() {
    super('GeminiJobSource');
  }

  async search(profile, query = '') {
    try {
      const discoveredJobs = await discoverJobsWithGemini(profile, query);
      return (discoveredJobs || []).map(job => ({
        ...job,
        sourceType: 'GEMINI',
        verificationStatus: 'VERIFIED',
        isActive: true,
      }));
    } catch (err) {
      console.error('GeminiJobSource search error:', err);
      return [];
    }
  }
}

