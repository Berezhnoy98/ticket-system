import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">Система заявок</Link>
        </div>
        <nav className="nav">
          <Link to="/tickets">Все заявки</Link>
          <Link to="/tickets/create">Создать заявку</Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && <span className="admin-badge">Администратор</span>}
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login">Вход для администраторов</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;