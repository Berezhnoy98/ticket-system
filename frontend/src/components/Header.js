import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  Assignment as TicketIcon,
  Add as AddIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TicketIcon sx={{ fontSize: 32 }} />
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Система заявок
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/tickets"
            startIcon={<DashboardIcon />}
            sx={{ 
              fontWeight: 500,
              px: 3,
              borderRadius: 10,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Все заявки
          </Button>
          
          <Button
            color="inherit"
            component={Link}
            to="/tickets/create"
            startIcon={<AddIcon />}
            sx={{ 
              fontWeight: 500,
              px: 3,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            Новая заявка
          </Button>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Chip
                  label="Администратор"
                  color="secondary"
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    color: 'white',
                  }}
                />
              )}
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  fontWeight: 500,
                  px: 3,
                  borderRadius: 10,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              sx={{ 
                fontWeight: 500,
                px: 3,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              Вход
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;