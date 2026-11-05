import { prisma } from '../db/prisma.js';

/**
 * Gets user's current coin balance.
 */
export const getUserBalance = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true, role: true }
  });
  return user?.coins ?? 0;
};

/**
 * Safely deducts coins within a Prisma transaction.
 * Throws an error if user does not have sufficient balance.
 */
export const deductCoins = async (userId, amount, type, description) => {
  if (amount <= 0) {
    throw new Error('Deduction amount must be positive');
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.coins < amount) {
      const err = new Error(`Insufficient coins. You have ${user.coins} coins, but this action requires ${amount} coins.`);
      err.code = 'INSUFFICIENT_COINS';
      err.status = 402;
      throw err;
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: {
          decrement: amount
        }
      },
      select: { coins: true }
    });

    const transaction = await tx.coinTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description: description || `Deducted ${amount} coins for ${type}`
      }
    });

    return {
      newBalance: updatedUser.coins,
      transaction
    };
  });
};

/**
 * Safely rewards coins to a user within a transaction.
 */
export const rewardCoins = async (userId, amount, type, description) => {
  if (amount <= 0) {
    throw new Error('Reward amount must be positive');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: {
          increment: amount
        }
      },
      select: { coins: true }
    });

    const transaction = await tx.coinTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description || `Earned ${amount} coins for ${type}`
      }
    });

    return {
      newBalance: updatedUser.coins,
      transaction
    };
  });
};

/**
 * Gets user's coin transaction history.
 */
export const getTransactionHistory = async (userId) => {
  return await prisma.coinTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

