import { prisma } from '../db/prisma.js';
import { CONFIG } from '../config/constants.js';
import { deductCoins, rewardCoins } from '../services/coin.service.js';
import { jobSourceManager } from '../services/jobSources/JobSourceManager.js';
import { normalizeUrl, validateJobUrl } from '../services/validation.service.js';
import { calculateJobMatch } from '../services/matching.service.js';

export const searchJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query = '' } = req.body;

    // 1. Fetch candidate profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(400).json({
        message: 'Please upload your resume first so AI can match opportunities to your profile.'
      });
    }

    // 2. Safely deduct coins atomically
    let deductionResult;
    try {
      deductionResult = await deductCoins(
        userId,
        CONFIG.SEARCH_COST,
        'JOB_SEARCH',
        `Job search: "${query || 'Profile Match'}"`
      );
    } catch (coinError) {
      if (coinError.code === 'INSUFFICIENT_COINS') {
        return res.status(402).json({
          message: coinError.message,
          code: 'INSUFFICIENT_COINS',
          searchCost: CONFIG.SEARCH_COST
        });
      }
      throw coinError;
    }

    // 3. Discover and match jobs across all modular sources
    const jobs = await jobSourceManager.discoverAndMatchJobs(profile, query);

    res.json({
      message: 'Jobs discovered and matched successfully',
      remainingCoins: deductionResult.newBalance,
      searchCost: CONFIG.SEARCH_COST,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ message: error.message || 'Error occurred while discovering jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // If authenticated user has a profile, calculate match score
    let matchData = null;
    if (req.user?.userId) {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.userId }
      });
      if (profile) {
        matchData = calculateJobMatch(profile, job);
      }
    }

    res.json({
      job: {
        ...job,
        ...(matchData || {})
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Failed to retrieve job details' });
  }
};

export const submitJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      company,
      description,
      location,
      jobType = 'INTERNSHIP',
      experienceLevel = 'INTERN',
      skills = [],
      eligibility = '',
      graduationYears = [],
      applicationUrl
    } = req.body;

    if (!title || !company || !applicationUrl) {
      return res.status(400).json({
        message: 'Title, company, and application URL are required'
      });
    }

    const cleanUrl = normalizeUrl(applicationUrl);

    // Check duplicate
    const existingJob = await prisma.job.findUnique({
      where: { applicationUrl: cleanUrl }
    });

    if (existingJob) {
      return res.status(400).json({
        message: 'This job application URL already exists in our system. Duplicate submissions cannot earn coins.'
      });
    }

    // Validate URL syntax and accessibility
    const validation = await validateJobUrl(cleanUrl);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'The submitted application URL appears to be invalid or inaccessible.'
      });
    }

    // Create job and reward user inside atomic transaction
    const parsedGradYears = Array.isArray(graduationYears)
      ? graduationYears.map(y => parseInt(y, 10)).filter(Boolean)
      : [];

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description: description || '',
        location: location || 'Remote',
        jobType,
        experienceLevel,
        skills: Array.isArray(skills) ? skills : [],
        eligibility,
        graduationYears: parsedGradYears,
        applicationUrl: cleanUrl,
        sourceType: 'USER',
        createdById: userId,
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date()
      }
    });

    // Reward coins
    const rewardResult = await rewardCoins(
      userId,
      CONFIG.VALID_JOB_REWARD,
      'JOB_SUBMISSION_REWARD',
      `Contributed verified job: ${title} at ${company}`
    );

    res.status(201).json({
      message: `Job verified and published! You earned +${CONFIG.VALID_JOB_REWARD} coins!`,
      job,
      coinsEarned: CONFIG.VALID_JOB_REWARD,
      newBalance: rewardResult.newBalance
    });
  } catch (error) {
    console.error('Job submission error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit job' });
  }
};

export const createHirerJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      company,
      description,
      location,
      jobType = 'INTERNSHIP',
      experienceLevel = 'ENTRY_LEVEL',
      skills = [],
      eligibility = '',
      graduationYears = [],
      applicationUrl
    } = req.body;

    if (!title || !company || !applicationUrl) {
      return res.status(400).json({ message: 'Title, company, and application URL are required' });
    }

    const cleanUrl = normalizeUrl(applicationUrl);

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        location,
        jobType,
        experienceLevel,
        skills: Array.isArray(skills) ? skills : [],
        eligibility,
        graduationYears: Array.isArray(graduationYears) ? graduationYears.map(Number) : [],
        applicationUrl: cleanUrl,
        sourceType: 'HIRER',
        createdById: userId,
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Hirer job post error:', error);
    res.status(500).json({ message: 'Failed to create job posting' });
  }
};

export const getHirerJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { createdById: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (error) {
    console.error('Get hirer jobs error:', error);
    res.status(500).json({ message: 'Failed to retrieve your job postings' });
  }
};

