import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Comment as CommentIcon,
  Schedule as TimeIcon,
  Business as DepartmentIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Attachment as AttachmentIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  PersonOutline as AuthorIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import api from '../services/api';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния фильтров
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    priority: 'all',
    assignedTo: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchTerm]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке заявок:', error);
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = tickets;

    // Фильтр по статусу
    if (filters.status !== 'all') {
      result = result.filter(ticket => ticket.status === filters.status);
    }

    // Фильтр по подразделению
    if (filters.department !== 'all') {
      result = result.filter(ticket => ticket.department === filters.department);
    }

    // Фильтр по приоритету
    if (filters.priority !== 'all') {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }

    // Фильтр по ответственному
    if (filters.assignedTo !== 'all') {
      result = result.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }

    // Поиск по заголовку и описанию
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.ticketNumber.toLowerCase().includes(term) ||
        ticket.authorName.toLowerCase().includes(term)
      );
    }

    setFilteredTickets(result);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      department: 'all',
      priority: 'all',
      assignedTo: 'all'
    });
    setSearchTerm('');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      open: { label: 'Открыта', color: 'primary', variant: 'filled' },
      in_progress: { label: 'В работе', color: 'warning', variant: 'filled' },
      resolved: { label: 'Решена', color: 'success', variant: 'filled' },
      closed: { label: 'Закрыта', color: 'default', variant: 'filled' },
    };
    
    const config = statusConfig[status] || { label: status, color: 'default', variant: 'filled' };
    return (
      <Chip 
        label={config.label} 
        color={config.color}
        variant={config.variant}
        size="small"
        sx={{ 
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { label: 'Низкий', color: 'success', icon: <FlagIcon sx={{ fontSize: 14 }} /> },
      medium: { label: 'Средний', color: 'warning', icon: <FlagIcon sx={{ fontSize: 14 }} /> },
      high: { label: 'Высокий', color: 'error', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
      critical: { label: 'Критичный', color: 'error', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
    };
    
    const config = priorityConfig[priority] || { label: 'Средний', color: 'warning', icon: <FlagIcon sx={{ fontSize: 14 }} /> };
    return (
      <Chip 
        label={config.label} 
        color={config.color}
        variant="filled"
        size="small"
        icon={config.icon}
        sx={{ 
          fontWeight: 600,
          fontSize: '0.7rem',
        }}
      />
    );
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Полярная звезда': 'primary',
      'Перспектива': 'secondary',
      'Созвездие': 'success',
      'Семейный дом': 'warning',
    };
    return colors[department] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не установлен';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 2; // 2 дня до дедлайна
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  // Получение уникальных значений для фильтров
  const getUniqueValues = (field) => {
    return [...new Set(tickets.map(ticket => ticket[field]).filter(Boolean))];
  };

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'open', label: 'Открыта' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'resolved', label: 'Решена' },
    { value: 'closed', label: 'Закрыта' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'Все приоритеты' },
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критичный' },
  ];

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            Загрузка заявок...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            fontSize: '1rem',
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и кнопка создания */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Все заявки
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {filteredTickets.length} из {tickets.length} заявок
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/tickets/create"
          size="large"
          sx={{ 
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 3,
          }}
        >
          Создать заявку
        </Button>
      </Box>

      {/* Панель фильтров */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Фильтры
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button 
            onClick={clearFilters}
            variant="outlined"
            size="small"
          >
            Сбросить
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Поиск */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Поиск по заявкам"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Номер, заголовок, описание или автор..."
              size="small"
            />
          </Grid>

          {/* Статус */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Статус"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="small"
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Приоритет */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Приоритет"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              size="small"
            >
              {priorityOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Подразделение */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Подразделение"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              size="small"
            >
              <MenuItem value="all">Все подразделения</MenuItem>
              {getUniqueValues('department').map(dept => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Ответственный */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Ответственный"
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              size="small"
            >
              <MenuItem value="all">Все ответственные</MenuItem>
              {getUniqueValues('assignedTo').map(person => (
                <MenuItem key={person} value={person}>
                  {person}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Активные фильтры */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.status !== 'all' && (
            <Chip 
              label={`Статус: ${statusOptions.find(s => s.value === filters.status)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('status', 'all')}
            />
          )}
          {filters.priority !== 'all' && (
            <Chip 
              label={`Приоритет: ${priorityOptions.find(p => p.value === filters.priority)?.label}`}
              size="small"
              onDelete={() => handleFilterChange('priority', 'all')}
            />
          )}
          {filters.department !== 'all' && (
            <Chip 
              label={`Подразделение: ${filters.department}`}
              size="small"
              onDelete={() => handleFilterChange('department', 'all')}
            />
          )}
          {filters.assignedTo !== 'all' && (
            <Chip 
              label={`Ответственный: ${filters.assignedTo}`}
              size="small"
              onDelete={() => handleFilterChange('assignedTo', 'all')}
            />
          )}
          {searchTerm && (
            <Chip 
              label={`Поиск: "${searchTerm}"`}
              size="small"
              onDelete={() => setSearchTerm('')}
            />
          )}
        </Box>
      </Paper>

      {filteredTickets.length === 0 ? (
        <Card sx={{ 
          textAlign: 'center', 
          py: 10,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }}>
          <CardContent>
            <Typography variant="h4" color="textSecondary" gutterBottom fontWeight={600}>
              Заявки не найдены
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              {tickets.length === 0 
                ? 'Создайте первую заявку для начала работы с системой'
                : 'Попробуйте изменить параметры фильтрации'
              }
            </Typography>
            {tickets.length === 0 ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                component={Link}
                to="/tickets/create"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                }}
              >
                Создать первую заявку
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="large"
                onClick={clearFilters}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id}
              component={Link}
              to={`/tickets/${ticket.id}`}
              sx={{ 
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                cursor: 'pointer',
                border: isDeadlinePassed(ticket.deadline) ? '2px solid' : '1px solid',
                borderColor: isDeadlinePassed(ticket.deadline) ? 'error.main' : 'grey.200',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  backgroundColor: isDeadlinePassed(ticket.deadline) ? 'error.50' : 'primary.50',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  {/* Основной контент */}
                  <Box sx={{ flex: 1 }}>
                    {/* Заголовок и мета-информация */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.4,
                            color: 'text.primary',
                            mb: 0.5,
                          }}
                        >
                          {ticket.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="body2" 
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          >
                            #{ticket.id}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AuthorIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="textSecondary">
                              {ticket.authorName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="textSecondary">
                              {formatDateTime(ticket.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusChip(ticket.status)}
                        <ArrowIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      </Box>
                    </Box>

                    {/* Описание */}
                    <Typography 
                      variant="body1" 
                      color="textSecondary"
                      sx={{ 
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {ticket.description}
                    </Typography>

                    {/* Детальная информация */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                      {/* Подразделение */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DepartmentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Chip
                          label={ticket.department}
                          color={getDepartmentColor(ticket.department)}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

                      {/* Ответственный */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {ticket.assignedTo}
                        </Typography>
                      </Box>

                      {/* Срочность */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPriorityChip(ticket.priority)}
                      </Box>

                      {/* Дедлайн */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ 
                          fontSize: 16, 
                          color: isDeadlinePassed(ticket.deadline) ? 'error.main' : 
                                 isDeadlineApproaching(ticket.deadline) ? 'warning.main' : 'text.secondary' 
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isDeadlinePassed(ticket.deadline) ? 'error.main' : 
                                   isDeadlineApproaching(ticket.deadline) ? 'warning.main' : 'text.secondary',
                            fontWeight: isDeadlinePassed(ticket.deadline) ? 600 : 'normal'
                          }}
                        >
                          {formatDate(ticket.deadline)}
                        </Typography>
                      </Box>

                      {/* Комментарии */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary" fontWeight={600}>
                          {ticket.commentsCount || 0}
                        </Typography>
                      </Box>

                      {/* Файлы */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary" fontWeight={600}>
                          {ticket.filesCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default TicketList;