const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error: - auth.js:25', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Неверный токен' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек' });
    }
    
    res.status(500).json({ message: 'Ошибка аутентификации' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { auth, adminAuth };