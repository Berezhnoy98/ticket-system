const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error: - auth.js:52', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Register (for creating initial admin)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isAdmin: true
    });

    res.status(201).json({ 
      message: 'Пользователь создан успешно',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Register error: - auth.js:95', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
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
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error: - auth.js:128', error);
    res.status(401).json({ message: 'Неверный токен' });
  }
});

module.exports = router;