import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching ticket with ID: - TicketDetail.js:28', id);
      
      const [ticketResponse, commentsResponse] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/comments/tickets/${id}/comments`)
      ]);
      
      console.log('Ticket response: - TicketDetail.js:35', ticketResponse.data);
      console.log('Comments response: - TicketDetail.js:36', commentsResponse.data);
      
      setTicket(ticketResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных: - TicketDetail.js:41', error);
      if (error.response?.status === 404) {
        setError('Заявка не найдена');
      } else {
        setError('Ошибка при загрузке заявки');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCommentLoading(true);
    try {
      const response = await api.post(`/comments/tickets/${id}/comments`, {
        content: newComment
      });
      
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария: - TicketDetail.js:71', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Ошибка при добавлении комментария');
      }
    } finally {
      setCommentLoading(false);
    }
  };

  const updateTicketStatus = async (newStatus) => {
    try {
      const response = await api.put(`/tickets/${id}`, { status: newStatus });
      setTicket(response.data);
    } catch (error) {
      console.error('Ошибка при обновлении статуса: - TicketDetail.js:87', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      open: 'Открыта',
      in_progress: 'В работе',
      resolved: 'Решена',
      closed: 'Закрыта'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="ticket-detail-container">
        <div className="loading">Загрузка заявки...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail-container">
        <div className="error-message" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>{error || 'Заявка не найдена'}</h2>
          <button 
            onClick={() => navigate('/tickets')}
            style={{ marginTop: '20px' }}
          >
            Вернуться к списку заявок
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-container">
      <div className="ticket-header">
        <h1>{ticket.title}</h1>
        <div className="ticket-meta">
          <span className="department">{ticket.department}</span>
          <span className="status">{getStatusText(ticket.status)}</span>
          <span className="date">
            Создана: {new Date(ticket.createdAt).toLocaleString('ru-RU')}
          </span>
        </div>
      </div>

      <div className="ticket-content">
        <div className="ticket-description">
          <h3>Описание:</h3>
          <p>{ticket.description}</p>
        </div>

        <div className="ticket-author">
          <strong>Автор:</strong> {ticket.authorName} ({ticket.authorEmail})
        </div>

        {isAdmin && (
          <div className="admin-controls">
            <h3>Управление статусом:</h3>
            <div className="status-buttons">
              <button 
                onClick={() => updateTicketStatus('open')}
                className={ticket.status === 'open' ? 'active' : ''}
              >
                Открыта
              </button>
              <button 
                onClick={() => updateTicketStatus('in_progress')}
                className={ticket.status === 'in_progress' ? 'active' : ''}
              >
                В работе
              </button>
              <button 
                onClick={() => updateTicketStatus('resolved')}
                className={ticket.status === 'resolved' ? 'active' : ''}
              >
                Решена
              </button>
              <button 
                onClick={() => updateTicketStatus('closed')}
                className={ticket.status === 'closed' ? 'active' : ''}
              >
                Закрыта
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="comments-section">
        <h3>Комментарии ({comments.length})</h3>
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <strong>{comment.authorName}</strong>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="no-comments" style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              Комментариев пока нет
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="add-comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Введите ваш комментарий..."
              rows="4"
              required
            />
            <button type="submit" disabled={commentLoading}>
              {commentLoading ? 'Отправка...' : 'Добавить комментарий'}
            </button>
          </form>
        ) : (
          <div className="login-prompt" style={{ 
            textAlign: 'center', 
            padding: '30px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p>Чтобы оставить комментарий, пожалуйста, <a href="/login">войдите в систему</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;