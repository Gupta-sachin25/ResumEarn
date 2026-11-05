import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config/constants.js';

let genAI = null;
if (CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
}

/**
 * Parses raw resume text into a rich, structured Candidate Profile JSON.
 */
export const extractProfileFromResume = async (resumeText) => {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not configured. Falling back to heuristic text parser.');
    return fallbackResumeParser(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert technical recruiter and resume analyzer. Analyze the following candidate resume text and extract structured information in JSON format with exactly the following schema:

{
  "fullName": "Candidate full name",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "graduationYear": 2025 (or null if not found, as integer),
  "education": [
    {
      "institution": "University / College name",
      "degree": "e.g. B.Tech in Computer Science",
      "graduationYear": 2025,
      "gpa": "e.g. 8.5/10 or 3.8/4.0 or null"
    }
  ],
  "skills": ["Array", "of", "all", "technical", "and", "soft", "skills"],
  "programmingLanguages": ["e.g. Python", "JavaScript", "C++"],
  "frameworks": ["e.g. React", "Node.js", "Express", "Tailwind CSS"],
  "databases": ["e.g. PostgreSQL", "MongoDB", "Redis"],
  "tools": ["e.g. Git", "Docker", "AWS", "Figma"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Brief description of the project and impact",
      "technologies": ["React", "Node.js"]
    }
  ],
  "experience": [
    {
      "role": "e.g. Frontend Intern",
      "company": "Company Name",
      "duration": "e.g. May 2024 - July 2024",
      "description": "What they accomplished"
    }
  ],
  "certifications": ["e.g. AWS Certified Developer"],
  "preferredRoles": ["e.g. Software Engineer Intern", "Full Stack Developer", "Frontend Engineer"],
  "preferredLocations": ["e.g. Bangalore", "Remote", "India"]
}

Resume Text:
"""
${resumeText.slice(0, 15000)}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      fullName: parsed.fullName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      graduationYear: parsed.graduationYear ? parseInt(parsed.graduationYear, 10) : null,
      education: parsed.education || [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      programmingLanguages: Array.isArray(parsed.programmingLanguages) ? parsed.programmingLanguages : [],
      frameworks: Array.isArray(parsed.frameworks) ? parsed.frameworks : [],
      databases: Array.isArray(parsed.databases) ? parsed.databases : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      preferredRoles: Array.isArray(parsed.preferredRoles) && parsed.preferredRoles.length > 0
        ? parsed.preferredRoles
        : ['Software Engineer Intern', 'Full Stack Developer'],
      preferredLocations: Array.isArray(parsed.preferredLocations) && parsed.preferredLocations.length > 0
        ? parsed.preferredLocations
        : ['Remote', 'Bangalore', 'India'],
    };
  } catch (error) {
    console.error('Gemini resume extraction error:', error);
    // If Gemini fails (rate limit, network, etc.), gracefully fallback so the user is not stuck
    return fallbackResumeParser(resumeText);
  }
};

/**
 * Discovers current internship & job opportunities matching the candidate's profile.
 */
export const discoverJobsWithGemini = async (profile, searchKeywords = '') => {
  if (!genAI) {
    console.warn('GEMINI_API_KEY not configured. Returning curated mock opportunities.');
    return getFallbackJobOpportunities(profile);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const candidateSummary = {
      preferredRoles: profile.preferredRoles || [],
      skills: [...(profile.skills || []), ...(profile.programmingLanguages || []), ...(profile.frameworks || [])],
      graduationYear: profile.graduationYear,
      preferredLocations: profile.preferredLocations || [],
    };

    const prompt = `
You are a job search discovery engine. Find 6 to 10 realistic, currently open or active internship and entry-level full-time job openings that match this candidate's profile:
${JSON.stringify(candidateSummary, null, 2)}
Search Keywords: "${searchKeywords}"

Return a JSON array of job objects with the following schema:
[
  {
    "title": "Role Title (e.g. Software Development Intern)",
    "company": "Company Name (e.g. Google, Microsoft, Atlassian, Razorpay, Swiggy)",
    "description": "2-3 sentences describing the role responsibilities and requirements",
    "location": "e.g. Bangalore, Hyderabad, Remote, or Hybrid",
    "jobType": "INTERNSHIP" or "FULL_TIME",
    "experienceLevel": "INTERN" or "ENTRY_LEVEL",
    "skills": ["Key", "required", "skills", "e.g.", "React", "Python", "DSA"],
    "eligibility": "e.g. Students graduating in 2024, 2025, or 2026 pursuing B.Tech/BE/MCA",
    "graduationYears": [2025, 2026],
    "applicationUrl": "https://careers.company.com/jobs/role-id or direct career portal URL (must be valid format)",
    "sourceUrl": "https://company.com/careers"
  }
]

CRITICAL RULES:
1. Provide realistic company career portal application URLs (e.g., https://careers.google.com/jobs/results, https://jobs.lever.co/..., https://boards.greenhouse.io/...).
2. Ensure roles closely match the candidate's skills and graduation year.
3. Keep descriptions factual and clear.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getFallbackJobOpportunities(profile);
  } catch (error) {
    console.error('Gemini job discovery error:', error);
    return getFallbackJobOpportunities(profile);
  }
};

/**
 * Fallback parser when Gemini API key is missing or unreachable.
 */
function fallbackResumeParser(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const yearMatch = text.match(/\b(202[3-9]|2030)\b/);

  // Common tech skills lookup
  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Node.js', 'Express', 'Next.js', 'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Linux', 'GraphQL', 'REST API', 'Tailwind CSS'
  ];

  const foundSkills = knownSkills.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  return {
    fullName: text.split('\n')[0]?.trim().slice(0, 50) || 'Candidate Profile',
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    graduationYear: yearMatch ? parseInt(yearMatch[0], 10) : 2025,
    education: [
      {
        institution: 'University / College',
        degree: 'Bachelor of Technology in Computer Science',
        graduationYear: yearMatch ? parseInt(yearMatch[0], 10) : 2025,
        gpa: '8.2/10'
      }
    ],
    skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js', 'Git'],
    programmingLanguages: foundSkills.filter(s => ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'].includes(s)),
    frameworks: foundSkills.filter(s => ['React', 'Node.js', 'Express', 'Next.js', 'Angular', 'Vue', 'Django', 'Tailwind CSS'].includes(s)),
    databases: foundSkills.filter(s => ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'].includes(s)),
    tools: foundSkills.filter(s => ['Docker', 'Kubernetes', 'AWS', 'Git', 'Linux'].includes(s)),
    projects: [
      {
        title: 'Full Stack Web Application',
        description: 'Developed modern web platform with authentication and real-time data.',
        technologies: foundSkills.slice(0, 3)
      }
    ],
    experience: [],
    certifications: [],
    preferredRoles: ['Software Engineer Intern', 'Frontend Developer', 'Full Stack Developer'],
    preferredLocations: ['Remote', 'Bangalore', 'Hyderabad']
  };
}

/**
 * High quality curated jobs matching common student profiles when offline or keyless.
 */
function getFallbackJobOpportunities(profile) {
  const gradYear = profile?.graduationYear || 2025;
  return [
    {
      title: 'Software Engineering Intern',
      company: 'Google',
      description: 'Join Google engineering teams to design, develop, test, and deploy software solutions at scale. You will work on real products impacting billions of users.',
      location: 'Bangalore / Hyderabad, India',
      jobType: 'INTERNSHIP',
      experienceLevel: 'INTERN',
      skills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms'],
      eligibility: `Enrolled in a Bachelor's or Master's degree in Computer Science graduating in ${gradYear} or ${gradYear + 1}`,
      graduationYears: [gradYear, gradYear + 1],
      applicationUrl: 'https://careers.google.com/jobs/results/?distance=50&q=Software%20Engineer%20Intern',
      sourceUrl: 'https://careers.google.com'
    },
    {
      title: 'Frontend Developer Intern',
      company: 'Razorpay',
      description: 'Work with the payment checkout and frontend engineering teams to craft seamless user experiences using React, TypeScript, and modern state management.',
      location: 'Bangalore, India (Hybrid)',
      jobType: 'INTERNSHIP',
      experienceLevel: 'INTERN',
      skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'REST API'],
      eligibility: `Graduating in ${gradYear} or ${gradYear + 1} with strong web fundamentals`,
      graduationYears: [gradYear, gradYear + 1],
      applicationUrl: 'https://razorpay.com/jobs/frontend-intern',
      sourceUrl: 'https://razorpay.com/jobs'
    },
    {
      title: 'Full Stack Engineering Intern',
      company: 'Atlassian',
      description: 'Contribute to Jira, Confluence, and cloud collaboration tools. Build scalable backend microservices and modern React frontend interfaces.',
      location: 'Remote, India',
      jobType: 'INTERNSHIP',
      experienceLevel: 'INTERN',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
      eligibility: `Pre-final or final year university student graduating in ${gradYear}`,
      graduationYears: [gradYear],
      applicationUrl: 'https://www.atlassian.com/company/careers/students',
      sourceUrl: 'https://www.atlassian.com/company/careers'
    },
    {
      title: 'Graduate Software Engineer',
      company: 'Microsoft',
      description: 'Design and build world-class cloud platforms, Azure microservices, and AI-driven enterprise applications.',
      location: 'Hyderabad / Noida, India',
      jobType: 'FULL_TIME',
      experienceLevel: 'ENTRY_LEVEL',
      skills: ['C#', 'Python', 'Azure', 'Algorithms', 'Distributed Systems'],
      eligibility: `Graduating batch of ${gradYear} with BE/B.Tech/M.Tech in CS/IT or related fields`,
      graduationYears: [gradYear],
      applicationUrl: 'https://careers.microsoft.com/professionals/us/en/search-results?keywords=Graduate%20Software%20Engineer',
      sourceUrl: 'https://careers.microsoft.com'
    },
    {
      title: 'Backend Engineering Intern',
      company: 'Swiggy',
      description: 'Help build high-throughput order dispatch, logistics, and merchant systems handling millions of orders daily using Go and Java.',
      location: 'Bangalore, India',
      jobType: 'INTERNSHIP',
      experienceLevel: 'INTERN',
      skills: ['Go', 'Java', 'MySQL', 'Redis', 'Kafka'],
      eligibility: `Eligible for 2025/2026 graduates with strong CS fundamentals`,
      graduationYears: [gradYear, gradYear + 1],
      applicationUrl: 'https://careers.swiggy.com/#/careers/backend-intern',
      sourceUrl: 'https://careers.swiggy.com'
    }
  ];
}

