import { CONFIG } from '../config/constants.js';

/**
 * Calculates a deterministic match score and skill breakdown between candidate profile and job listing.
 */
export const calculateJobMatch = (profile, job) => {
  const weights = CONFIG.WEIGHTS;

  // 1. SKILLS MATCHING (35%)
  const candidateSkills = new Set([
    ...(profile.skills || []),
    ...(profile.programmingLanguages || []),
    ...(profile.frameworks || []),
    ...(profile.databases || []),
    ...(profile.tools || [])
  ].map(s => s.toLowerCase().trim()));

  const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());
  const matchedSkills = [];
  const missingSkills = [];

  if (jobSkills.length > 0) {
    jobSkills.forEach(reqSkill => {
      // Check exact or partial match
      const isMatched = Array.from(candidateSkills).some(cSkill =>
        cSkill === reqSkill || cSkill.includes(reqSkill) || reqSkill.includes(cSkill)
      );

      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });
  }

  const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.8;

  // 2. ELIGIBILITY MATCHING (25%) - Hard Gatekeeper
  let eligibilityScore = 1.0;
  let eligibilityStatus = 'MATCHED';
  let eligibilityNotes = 'Candidate matches eligibility criteria';

  if (job.graduationYears && job.graduationYears.length > 0 && profile.graduationYear) {
    const isGradYearEligible = job.graduationYears.includes(profile.graduationYear);
    if (!isGradYearEligible) {
      eligibilityScore = 0.2; // Significant penalty for hard graduation mismatch
      eligibilityStatus = 'MISMATCHED';
      eligibilityNotes = `Job seeks batches (${job.graduationYears.join(', ')}), candidate is class of ${profile.graduationYear}`;
    }
  } else if (!profile.graduationYear) {
    eligibilityScore = 0.7;
    eligibilityStatus = 'UNKNOWN';
    eligibilityNotes = 'Graduation year not specified in candidate profile';
  }

  // 3. ROLE RELEVANCE (20%)
  const preferredRoles = (profile.preferredRoles || []).map(r => r.toLowerCase());
  const jobTitleLower = (job.title || '').toLowerCase();
  let roleScore = 0.4; // Base score

  if (preferredRoles.some(role => jobTitleLower.includes(role) || role.includes(jobTitleLower))) {
    roleScore = 1.0;
  } else if (
    jobTitleLower.includes('software') ||
    jobTitleLower.includes('developer') ||
    jobTitleLower.includes('engineer') ||
    jobTitleLower.includes('intern')
  ) {
    roleScore = 0.75;
  }

  // 4. EXPERIENCE LEVEL (10%)
  let experienceScore = 0.8;
  const isCandidateFresher = !profile.experience || profile.experience.length === 0;
  const isJobInternship = job.jobType === 'INTERNSHIP' || (job.experienceLevel || '').toLowerCase().includes('intern');

  if (isCandidateFresher && isJobInternship) {
    experienceScore = 1.0;
  } else if (!isCandidateFresher) {
    experienceScore = 1.0;
  }

  // 5. LOCATION (5%)
  let locationScore = 0.6;
  const preferredLocations = (profile.preferredLocations || []).map(l => l.toLowerCase());
  const jobLocationLower = (job.location || '').toLowerCase();

  if (jobLocationLower.includes('remote')) {
    locationScore = 1.0;
  } else if (preferredLocations.some(pref => jobLocationLower.includes(pref))) {
    locationScore = 1.0;
  }

  // 6. EDUCATION (5%)
  let educationScore = 0.85;
  if (profile.education && profile.education.length > 0) {
    educationScore = 1.0;
  }

  // FINAL WEIGHTED CALCULATION
  const totalScore = (
    (skillScore * weights.skills) +
    (eligibilityScore * weights.eligibility) +
    (roleScore * weights.role) +
    (experienceScore * weights.experience) +
    (locationScore * weights.location) +
    (educationScore * weights.education)
  );

  const matchPercentage = Math.round(Math.min(Math.max(totalScore * 100, 15), 98));

  return {
    matchPercentage,
    matchedSkills: matchedSkills.map(capitalize),
    missingSkills: missingSkills.map(capitalize),
    eligibilityStatus,
    eligibilityNotes,
    breakdown: {
      skills: Math.round(skillScore * 100),
      eligibility: Math.round(eligibilityScore * 100),
      roleRelevance: Math.round(roleScore * 100),
      experience: Math.round(experienceScore * 100),
      location: Math.round(locationScore * 100),
      education: Math.round(educationScore * 100)
    }
  };
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

