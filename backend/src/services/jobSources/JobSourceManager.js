import { DatabaseJobSource } from './DatabaseJobSource.js';
import { GeminiJobSource } from './GeminiJobSource.js';
import { UserSubmittedJobSource } from './UserSubmittedJobSource.js';
import { normalizeUrl, validateJobUrl } from '../validation.service.js';
import { calculateJobMatch } from '../matching.service.js';
import { prisma } from '../../db/prisma.js';

export class JobSourceManager {
  constructor() {
    this.sources = [
      new DatabaseJobSource(),
      new GeminiJobSource(),
      new UserSubmittedJobSource()
    ];
  }

  /**
   * Registers an additional job source (e.g., RSS, public API).
   */
  registerSource(source) {
    this.sources.push(source);
  }

  /**
   * Discovers, normalizes, validates, caches, and matches jobs against a profile.
   */
  async discoverAndMatchJobs(profile, query = '') {
    // 1. Fetch from all sources in parallel
    const sourcePromises = this.sources.map(source =>
      source.search(profile, query).catch(err => {
        console.error(`Error querying source ${source.name}:`, err);
        return [];
      })
    );

    const sourceResults = await Promise.all(sourcePromises);
    const combinedJobs = sourceResults.flat();

    // 2. Normalize and deduplicate by application URL
    const seenUrls = new Set();
    const uniqueRawJobs = [];

    for (const job of combinedJobs) {
      if (!job.applicationUrl || !job.title || !job.company) continue;

      const cleanUrl = normalizeUrl(job.applicationUrl);
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);

      uniqueRawJobs.push({
        ...job,
        applicationUrl: cleanUrl,
        skills: Array.isArray(job.skills) ? job.skills : [],
        graduationYears: Array.isArray(job.graduationYears) ? job.graduationYears : [],
      });
    }

    // 3. Persist new verified jobs to the database if not already present
    const persistedJobs = [];
    for (const job of uniqueRawJobs) {
      try {
        const existingJob = await prisma.job.findUnique({
          where: { applicationUrl: job.applicationUrl }
        });

        if (existingJob) {
          persistedJobs.push(existingJob);
        } else {
          // Validate URL before saving
          const validation = await validateJobUrl(job.applicationUrl);
          const newJob = await prisma.job.create({
            data: {
              title: job.title,
              company: job.company,
              description: job.description || '',
              location: job.location || 'Remote',
              jobType: job.jobType || 'INTERNSHIP',
              experienceLevel: job.experienceLevel || 'INTERN',
              skills: job.skills,
              eligibility: job.eligibility || '',
              graduationYears: job.graduationYears,
              applicationUrl: job.applicationUrl,
              sourceUrl: job.sourceUrl || '',
              sourceType: job.sourceType || 'GEMINI',
              isActive: true,
              verificationStatus: validation.isValid ? 'VERIFIED' : 'PENDING',
              lastVerifiedAt: new Date(),
            }
          });
          persistedJobs.push(newJob);
        }
      } catch (dbErr) {
        // In case of unique constraint race or db error, fallback to in-memory job
        persistedJobs.push(job);
      }
    }

    // 4. Calculate deterministic match scores using Matching Engine
    const matchedResults = persistedJobs.map(job => {
      const matchData = calculateJobMatch(profile, job);
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        description: job.description,
        skills: job.skills,
        eligibility: job.eligibility,
        graduationYears: job.graduationYears,
        applicationUrl: job.applicationUrl,
        sourceType: job.sourceType,
        verificationStatus: job.verificationStatus,
        lastVerifiedAt: job.lastVerifiedAt,
        ...matchData
      };
    });

    // 5. Sort by match percentage descending
    matchedResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return matchedResults;
  }
}

export const jobSourceManager = new JobSourceManager();

