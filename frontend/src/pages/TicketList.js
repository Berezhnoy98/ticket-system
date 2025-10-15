import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке заявок: - TicketList.js:19', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { text: 'Открыта', class: 'status-open' },
      in_progress: { text: 'В работе', class: 'status-in-progress' },
      resolved: { text: 'Решена', class: 'status-resolved' },
      closed: { text: 'Закрыта', class: 'status-closed' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Загрузка заявок...</div>;
  }

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h1>Все заявки</h1>
        <Link to="/tickets/create" className="create-ticket-btn">
          Создать новую заявку
        </Link>
      </div>
      
      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="ticket-meta">
              <span className="department">{ticket.department}</span>
              <span className="date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="ticket-description">{ticket.description}</p>
            <div className="ticket-footer">
              <span className="comments-count">
                Комментарии: {ticket.commentsCount || 0}
              </span>
              <Link to={`/tickets/${ticket.id}`} className="view-details">
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {tickets.length === 0 && (
        <div className="no-tickets">
          <p>Заявок пока нет</p>
          <Link to="/tickets/create" className="create-first-ticket">
            Создать первую заявку
          </Link>
        </div>
      )}
    </div>
  );
};

export default TicketList;