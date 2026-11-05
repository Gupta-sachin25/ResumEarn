import { prisma } from '../db/prisma.js';
import { rewardCoins, deductCoins } from '../services/coin.service.js';

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, verifiedJobs, totalSearches, totalCoinTx] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.coinTransaction.count({ where: { type: 'JOB_SEARCH' } }),
      prisma.coinTransaction.count(),
    ]);

    const coinSum = await prisma.user.aggregate({
      _sum: { coins: true }
    });

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        verifiedJobs,
        totalSearches,
        totalCoinTransactions: totalCoinTx,
        totalCoinsInCirculation: coinSum._sum.coins || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats' });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      take: 50
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({ message: 'Failed to retrieve jobs' });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, isActive } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(verificationStatus && { verificationStatus }),
        ...(isActive !== undefined && { isActive }),
        lastVerifiedAt: new Date()
      }
    });

    res.json({ message: 'Job status updated', job });
  } catch (error) {
    console.error('Admin update job status error:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    res.json({ message: 'Job permanently deleted' });
  } catch (error) {
    console.error('Admin delete job error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        coins: true,
        createdAt: true,
        _count: {
          select: {
            createdJobs: true,
            coinTransactions: true,
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

export const adjustUserCoins = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const parsedAmount = parseInt(amount, 10);

    if (isNaN(parsedAmount) || parsedAmount === 0) {
      return res.status(400).json({ message: 'Valid non-zero coin amount is required' });
    }

    let result;
    if (parsedAmount > 0) {
      result = await rewardCoins(
        userId,
        parsedAmount,
        'ADMIN_ADJUSTMENT',
        reason || `Admin credit: +${parsedAmount} coins`
      );
    } else {
      result = await deductCoins(
        userId,
        Math.abs(parsedAmount),
        'ADMIN_ADJUSTMENT',
        reason || `Admin debit: ${parsedAmount} coins`
      );
    }

    res.json({
      message: `Adjusted user coins successfully. New balance: ${result.newBalance}`,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Admin coin adjustment error:', error);
    res.status(500).json({ message: error.message || 'Failed to adjust coins' });
  }
};

