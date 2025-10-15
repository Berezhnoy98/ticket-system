const express = require('express');
const { Comment, Ticket } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comments for ticket
router.get('/tickets/:ticketId/comments', async (req, res) => {
  try {
    console.log('Getting comments for ticket ID: - comments.js:10', req.params.ticketId);
    
    const comments = await Comment.findAll({
      where: { ticketId: req.params.ticketId },
      order: [['createdAt', 'ASC']]
    });

    console.log('Found comments: - comments.js:17', comments.length);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error: - comments.js:20', error);
    res.status(500).json({ message: 'Ошибка при загрузке комментариев' });
  }
});

// Add comment to ticket
router.post('/tickets/:ticketId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const ticketId = req.params.ticketId;

    console.log('Adding comment to ticket: - comments.js:31', ticketId, 'Content:', content);

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Комментарий не может быть пустым' });
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const authorName = req.user.isAdmin ? 'Администратор' : req.user.name;

    const comment = await Comment.create({
      content: content.trim(),
      authorName,
      ticketId,
      authorId: req.user.id
    });

    console.log('Comment created: - comments.js:52', comment.id);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error: - comments.js:55', error);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
});

module.exports = router;