import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  INITIAL_USER_COINS: parseInt(process.env.INITIAL_USER_COINS || '100', 10),
  SEARCH_COST: parseInt(process.env.SEARCH_COST || '10', 10),
  VALID_JOB_REWARD: parseInt(process.env.VALID_JOB_REWARD || '5', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey_change_this_in_production',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  PORT: parseInt(process.env.PORT || '5000', 10),
  WEIGHTS: {
    skills: 0.35,
    eligibility: 0.25,
    role: 0.20,
    experience: 0.10,
    location: 0.05,
    education: 0.05
  }
};

