const express = require('express');
const { Ticket, Comment, File } = require('../models/simple-models');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Generate simple ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now().toString();
  return `#${timestamp.substr(-6)}`; // Просто последние 6 цифр timestamp
};

// Get all tickets
router.get('/', async (req, res) => {
  try {
    console.log('Getting all tickets...');
    
    const tickets = await Ticket.findAll({
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${tickets.length} tickets`);

    // Get comments count and files count for each ticket
    const ticketsWithCounts = await Promise.all(
      tickets.map(async (ticket) => {
        const commentsCount = await Comment.count({
          where: { ticketId: ticket.id }
        });

        const filesCount = await File.count({
          where: { ticketId: ticket.id }
        });
        
        const ticketData = ticket.toJSON();
        return {
          ...ticketData,
          commentsCount,
          filesCount,
          id: ticketData.id
        };
      })
    );

    res.json(ticketsWithCounts);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Ошибка при загрузке заявок' });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    console.log('Getting ticket with ID:', ticketId);
    
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: 'Неверный ID заявки' });
    }

    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      console.log('Ticket not found for ID:', ticketId);
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    console.log('Ticket found:', ticket.title);
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Ошибка при загрузке заявки' });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, department, authorName, authorEmail, priority, deadline, assignedTo } = req.body;

    console.log('Creating ticket with data:', { title, department, authorName, authorEmail, priority });

    // Validation
    if (!title || !description || !department || !authorName || !authorEmail) {
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }

    const ticket = await Ticket.create({
      ticketNumber: generateTicketNumber(),
      title,
      description,
      department,
      authorName,
      authorEmail,
      assignedTo: assignedTo || 'Не назначен',
      priority: priority || 'medium',
      deadline: deadline || null,
      status: 'open'
    });

    console.log('Ticket created with ID:', ticket.id, 'Number:', ticket.ticketNumber);

    res.status(201).json({
      ...ticket.toJSON(),
      commentsCount: 0,
      filesCount: 0
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
});

// Update ticket (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const { status, assignedTo, priority, deadline } = req.body;
    
    if (status && !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadline;

    await ticket.update(updateData);
    console.log('Ticket updated:', ticketId, updateData);
    
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
});

module.exports = router;