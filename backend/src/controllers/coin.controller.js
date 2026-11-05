import { getUserBalance, getTransactionHistory } from '../services/coin.service.js';

export const getBalance = async (req, res) => {
  try {
    const balance = await getUserBalance(req.user.userId);
    res.json({ coins: balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Failed to retrieve coin balance' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await getTransactionHistory(req.user.userId);
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to retrieve transaction history' });
  }
};

