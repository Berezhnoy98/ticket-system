const express = require('express');
const { Ticket, Comment } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Get comments count for each ticket
    const ticketsWithCounts = await Promise.all(
      tickets.map(async (ticket) => {
        const commentsCount = await Comment.count({
          where: { ticketId: ticket.id }
        });
        
        return {
          ...ticket.toJSON(),
          commentsCount
        };
      })
    );

    res.json(ticketsWithCounts);
  } catch (error) {
    console.error('Get tickets error: - tickets.js:30', error);
    res.status(500).json({ message: 'Ошибка при загрузке заявок' });
  }
});

// Get single ticket with comments
router.get('/:id', async (req, res) => {
  try {
    console.log('Getting ticket with ID: - tickets.js:38', req.params.id); // Добавим лог
    
    const ticket = await Ticket.findByPk(req.params.id);
    
    if (!ticket) {
      console.log('Ticket not found for ID: - tickets.js:43', req.params.id);
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    console.log('Ticket found: - tickets.js:47', ticket.title); // Добавим лог
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error: - tickets.js:50', error);
    res.status(500).json({ message: 'Ошибка при загрузке заявки' });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, department, authorName, authorEmail } = req.body;

    // Validation
    if (!title || !description || !department || !authorName || !authorEmail) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      department,
      authorName,
      authorEmail,
      status: 'open'
    });

    res.status(201).json({
      ...ticket.toJSON(),
      commentsCount: 0
    });
  } catch (error) {
    console.error('Create ticket error: - tickets.js:79', error);
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
});

// Update ticket (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const { status } = req.body;
    
    if (status && !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус' });
    }

    await ticket.update({ status });
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error: - tickets.js:101', error);
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
});

module.exports = router;