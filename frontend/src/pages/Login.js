import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Lock as LockIcon,
  Security as SecurityIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/tickets');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={8} sx={{ 
          padding: 6, 
          width: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4 
          }}>
            <Box sx={{
              position: 'relative',
              mb: 2
            }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                borderRadius: '50%',
                opacity: 0.1,
              }} />
              <LockIcon sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                position: 'relative',
                zIndex: 1,
              }} />
            </Box>
            <Typography component="h1" variant="h4" gutterBottom fontWeight={700}>
              Вход в систему
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              Для администраторов системы заявок
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'error.light'
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email адрес"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти в систему'}
            </Button>
          </Box>

          <Paper 
            elevation={2} 
            sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.100',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Тестовые данные
              </Typography>
            </Box>
            <Box sx={{ pl: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> admin@example.com
              </Typography>
              <Typography variant="body2">
                <strong>Пароль:</strong> admin123
              </Typography>
            </Box>
          </Paper>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;