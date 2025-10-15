const express = require('express');
const { Comment, Ticket } = require('../models/simple-models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comments for ticket
router.get('/tickets/:ticketId/comments', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    console.log('Getting comments for ticket ID:', ticketId);
    
    const comments = await Comment.findAll({
      where: { ticketId: ticketId },
      order: [['createdAt', 'ASC']]
    });

    console.log('Found comments:', comments.length);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Ошибка при загрузке комментариев' });
  }
});

// Add comment to ticket
router.post('/tickets/:ticketId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const ticketId = parseInt(req.params.ticketId);

    console.log('Adding comment to ticket:', ticketId, 'Content:', content);

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Комментарий не может быть пустым' });
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const authorName = req.user.isAdmin ? 'Администратор' : 'Пользователь';

    const comment = await Comment.create({
      content: content.trim(),
      authorName,
      ticketId: ticketId,
      authorId: req.user.id
    });

    console.log('Comment created:', comment.id);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
});

module.exports = router;