import { prisma } from '../db/prisma.js';

export const toggleSaveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;

    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (existing) {
      if (existing.status === 'SAVED') {
        // Toggle off
        await prisma.application.delete({
          where: { id: existing.id }
        });
        return res.json({ saved: false, message: 'Job removed from saved list' });
      } else {
        return res.json({ saved: true, application: existing, message: 'Job is already tracked in your applications' });
      }
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: 'SAVED'
      },
      include: { job: true }
    });

    res.status(201).json({ saved: true, application, message: 'Job saved to your tracker!' });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({ message: 'Failed to toggle save job' });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status' });
    }

    const application = await prisma.application.update({
      where: {
        id,
        userId // ensures ownership
      },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === 'APPLIED' && { appliedAt: new Date() })
      },
      include: { job: true }
    });

    res.json({ message: 'Application updated', application });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Failed to update application' });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await prisma.application.delete({
      where: {
        id,
        userId
      }
    });

    res.json({ message: 'Application removed from tracker' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Failed to delete application' });
  }
};

