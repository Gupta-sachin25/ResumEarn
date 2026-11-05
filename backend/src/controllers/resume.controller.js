import multer from 'multer';
import { extractTextFromPdf } from '../services/pdf.service.js';
import { extractProfileFromResume } from '../services/gemini.service.js';
import { prisma } from '../db/prisma.js';

// Multer memory storage configuration (Max 5MB PDF)
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed'), false);
    }
  }
}).single('resume');

export const uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide a PDF resume file' });
    }

    const userId = req.user.userId;

    // 1. Extract raw text from PDF
    const rawText = await extractTextFromPdf(req.file.buffer);

    // 2. Analyze with Gemini (or fallback if offline/no key)
    const profileData = await extractProfileFromResume(rawText);

    // 3. Upsert into database
    const profile = await prisma.candidateProfile.upsert({
      where: { userId },
      update: {
        fullName: profileData.fullName || req.user.name,
        email: profileData.email || req.user.email,
        phone: profileData.phone,
        graduationYear: profileData.graduationYear,
        education: profileData.education,
        skills: profileData.skills,
        programmingLanguages: profileData.programmingLanguages,
        frameworks: profileData.frameworks,
        databases: profileData.databases,
        tools: profileData.tools,
        projects: profileData.projects,
        experience: profileData.experience,
        certifications: profileData.certifications,
        preferredRoles: profileData.preferredRoles,
        preferredLocations: profileData.preferredLocations,
        rawText: rawText.slice(0, 10000),
      },
      create: {
        userId,
        fullName: profileData.fullName || req.user.name,
        email: profileData.email || req.user.email,
        phone: profileData.phone,
        graduationYear: profileData.graduationYear,
        education: profileData.education,
        skills: profileData.skills,
        programmingLanguages: profileData.programmingLanguages,
        frameworks: profileData.frameworks,
        databases: profileData.databases,
        tools: profileData.tools,
        projects: profileData.projects,
        experience: profileData.experience,
        certifications: profileData.certifications,
        preferredRoles: profileData.preferredRoles,
        preferredLocations: profileData.preferredLocations,
        rawText: rawText.slice(0, 10000),
      }
    });

    res.status(200).json({
      message: 'Resume uploaded and analyzed successfully',
      profile
    });
  } catch (error) {
    console.error('Upload and analyze error:', error);
    res.status(500).json({ message: error.message || 'Failed to process resume' });
  }
};

