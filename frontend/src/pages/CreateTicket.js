import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import api from '../services/api';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Полярная звезда',
    authorName: '',
    authorEmail: '',
    assignedTo: 'Не назначен',
    priority: 'medium',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const departments = [
    'Полярная звезда',
    'Перспектива',
    'Созвездие',
    'Семейный дом'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Низкий', color: 'success' },
    { value: 'medium', label: 'Средний', color: 'warning' },
    { value: 'high', label: 'Высокий', color: 'error' },
    { value: 'critical', label: 'Критичный', color: 'error' },
  ];

  const assignedToOptions = [
    'Не назначен',
    'Петр Сидоров',
    'Алексей Комаров',
    'Сергей Волков',
    'Мария Иванова',
    'Дмитрий Петров'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Форматируем дедлайн если он указан
      const ticketData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await api.post('/tickets', ticketData);
      navigate('/tickets');
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      setError('Ошибка при создании заявки. Пожалуйста, проверьте введенные данные и попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    const config = priorityOptions.find(p => p.value === priority) || priorityOptions[1];
    return <FlagIcon sx={{ color: `${config.color}.main` }} />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/tickets')}
        sx={{ 
          mb: 3, 
          color: 'primary.main',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'primary.50',
          }
        }}
      >
        Назад к списку заявок
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={8} sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="primary.main">
              Создать новую заявку
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Заполните форму ниже, чтобы создать новую заявку. Поля отмеченные * обязательны для заполнения.
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'error.light'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Основная информация */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    Основная информация
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Заголовок заявки *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={{ mb: 2 }}
                    helperText="Краткое описание проблемы"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Подробное описание *"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                    disabled={loading}
                    sx={{ mb: 2 }}
                    helperText="Опишите проблему максимально подробно"
                  />
                </Grid>

                {/* Контактная информация */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    Контактная информация
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ваше имя *"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ваш email *"
                    name="authorEmail"
                    type="email"
                    value={formData.authorEmail}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>

                {/* Детали заявки */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    Детали заявки
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Подразделение *"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 18 }} />
                          {dept}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Приоритет"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getPriorityIcon(option.value)}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Ответственный"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {assignedToOptions.map((person) => (
                      <MenuItem key={person} value={person}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                          {person}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Дедлайн"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    helperText="Крайний срок выполнения"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/tickets')}
                      disabled={loading}
                      size="large"
                      sx={{ 
                        px: 4,
                        borderRadius: 3,
                        fontWeight: 600,
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      size="large"
                      sx={{ 
                        px: 4,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {loading ? 'Создание...' : 'Создать заявку'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Боковая панель с информацией */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card elevation={8}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Подразделения
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Выберите соответствующее структурное подразделение для вашей заявки:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {departments.map((dept) => (
                    <Typography 
                      component="li" 
                      variant="body2" 
                      key={dept}
                      sx={{ 
                        mb: 1, 
                        color: formData.department === dept ? 'primary.main' : 'text.secondary',
                        fontWeight: formData.department === dept ? 600 : 'normal'
                      }}
                    >
                      {dept}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card elevation={8}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlagIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Приоритеты
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {priorityOptions.map((option) => (
                    <Box 
                      key={option.value}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: formData.priority === option.value ? `${option.color}.50` : 'transparent',
                        border: formData.priority === option.value ? `1px solid` : '1px solid transparent',
                        borderColor: formData.priority === option.value ? `${option.color}.main` : 'transparent'
                      }}
                    >
                      <FlagIcon sx={{ color: `${option.color}.main`, fontSize: 16 }} />
                      <Typography variant="body2" fontWeight={formData.priority === option.value ? 600 : 'normal'}>
                        {option.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateTicket;