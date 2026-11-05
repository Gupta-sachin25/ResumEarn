import { prisma } from '../db/prisma.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please upload a resume first.' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      graduationYear,
      skills,
      programmingLanguages,
      frameworks,
      databases,
      tools,
      preferredRoles,
      preferredLocations,
      projects,
      experience
    } = req.body;

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(graduationYear !== undefined && { graduationYear: parseInt(graduationYear, 10) || null }),
        ...(skills !== undefined && { skills }),
        ...(programmingLanguages !== undefined && { programmingLanguages }),
        ...(frameworks !== undefined && { frameworks }),
        ...(databases !== undefined && { databases }),
        ...(tools !== undefined && { tools }),
        ...(preferredRoles !== undefined && { preferredRoles }),
        ...(preferredLocations !== undefined && { preferredLocations }),
        ...(projects !== undefined && { projects }),
        ...(experience !== undefined && { experience }),
      },
      create: {
        userId: req.user.userId,
        fullName: fullName || req.user.name,
        email: email || req.user.email,
        phone,
        graduationYear: parseInt(graduationYear, 10) || null,
        skills: skills || [],
        programmingLanguages: programmingLanguages || [],
        frameworks: frameworks || [],
        databases: databases || [],
        tools: tools || [],
        preferredRoles: preferredRoles || ['Software Engineer Intern'],
        preferredLocations: preferredLocations || ['Remote'],
        projects: projects || [],
        experience: experience || [],
      }
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

