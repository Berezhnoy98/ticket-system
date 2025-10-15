import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CreateTicket.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Полярная звезда',
    authorName: '',
    authorEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = [
    'Полярная звезда',
    'Перспектива', 
    'Созвездие',
    'Семейный дом'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/tickets', formData);
      navigate('/tickets');
    } catch (error) {
      console.error('Ошибка при создании заявки: - CreateTicket.js:39', error);
      alert('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <div className="create-ticket-form">
        <h1>Создать новую заявку</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ваше имя *</label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ваш email *</label>
            <input
              type="email"
              name="authorEmail"
              value={formData.authorEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Структурное подразделение *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Заголовок заявки *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Описание проблемы *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать заявку'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;