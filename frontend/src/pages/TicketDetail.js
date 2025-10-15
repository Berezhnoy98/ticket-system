import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  ChatBubbleOutline as CommentIcon,
  Schedule as TimeIcon,
  Business as DepartmentIcon,
  Flag as FlagIcon,
  Attachment as AttachmentIcon,
  Warning as WarningIcon,
  PersonOutline as AuthorIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TicketDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ticketResponse, commentsResponse] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/comments/tickets/${id}/comments`)
      ]);
      
      setTicket(ticketResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
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
      console.error('Ошибка при добавлении комментария:', error);
      if (error.response?.status === 401) {
        navigate('/login');
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
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  const updateTicketAssignment = async (assignedTo) => {
    try {
      const response = await api.put(`/tickets/${id}`, { assignedTo });
      setTicket(response.data);
    } catch (error) {
      console.error('Ошибка при обновлении ответственного:', error);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      open: { label: 'Открыта', color: 'primary' },
      in_progress: { label: 'В работе', color: 'warning' },
      resolved: { label: 'Решена', color: 'success' },
      closed: { label: 'Закрыта', color: 'default' },
    };
    return config[status] || { label: status, color: 'default' };
  };

  const getPriorityConfig = (priority) => {
    const config = {
      low: { label: 'Низкий', color: 'success', icon: <FlagIcon sx={{ fontSize: 16 }} /> },
      medium: { label: 'Средний', color: 'warning', icon: <FlagIcon sx={{ fontSize: 16 }} /> },
      high: { label: 'Высокий', color: 'error', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
      critical: { label: 'Критичный', color: 'error', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
    };
    return config[priority] || { label: 'Средний', color: 'warning', icon: <FlagIcon sx={{ fontSize: 16 }} /> };
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Не установлен';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не установлен';
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
    return diffDays <= 2;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  const assignedToOptions = [
    'Не назначен',
    'Петр Сидоров',
    'Алексей Комаров',
    'Сергей Волков',
    'Мария Иванова',
    'Дмитрий Петров'
  ];

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !ticket) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" onClick={() => navigate('/tickets')}>
              К списку заявок
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error || 'Заявка не найдена'}
        </Alert>
      </Container>
    );
  }

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 3, color: 'text.primary' }}
      >
        Назад к списку заявок
      </Button>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            {/* Заголовок и статус */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                  {ticket.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    {ticket.ticketNumber}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AuthorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" color="textSecondary">
                      {ticket.authorName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" color="textSecondary">
                      {formatDateTime(ticket.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Chip 
                label={statusConfig.label} 
                color={statusConfig.color}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Описание */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Описание проблемы
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                  {ticket.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Детальная информация */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Основная информация
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DepartmentIcon sx={{ color: 'text.secondary' }} />
                        <Chip
                          label={ticket.department}
                          color={getDepartmentColor(ticket.department)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {priorityConfig.icon}
                        <Chip
                          label={priorityConfig.label}
                          color={priorityConfig.color}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {ticket.assignedTo}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Сроки
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Создана: {formatDate(ticket.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ 
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
                          Дедлайн: {formatDate(ticket.deadline)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Управление для администраторов */}
            {isAdmin && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Управление заявкой
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Статус заявки:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <Button
                          key={status}
                          variant={ticket.status === status ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => updateTicketStatus(status)}
                          sx={{ borderRadius: 2 }}
                        >
                          {getStatusConfig(status).label}
                        </Button>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Ответственный:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {assignedToOptions.map((person) => (
                        <Chip
                          key={person}
                          label={person}
                          variant={ticket.assignedTo === person ? 'filled' : 'outlined'}
                          color={ticket.assignedTo === person ? 'primary' : 'default'}
                          onClick={() => updateTicketAssignment(person)}
                          clickable
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Комментарии */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              <CommentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Комментарии ({comments.length})
            </Typography>

            <Box sx={{ mb: 4 }}>
              {comments.map((comment) => (
                <Card key={comment.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {comment.authorName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDateTime(comment.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {comment.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              
              {comments.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                  Комментариев пока нет
                </Typography>
              )}
            </Box>

            {isAuthenticated ? (
              <Box component="form" onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Добавить комментарий"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={commentLoading}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={commentLoading || !newComment.trim()}
                  startIcon={commentLoading ? <CircularProgress size={20} /> : <EditIcon />}
                >
                  {commentLoading ? 'Отправка...' : 'Добавить комментарий'}
                </Button>
              </Box>
            ) : (
              <Alert severity="info">
                Чтобы оставить комментарий, пожалуйста,{' '}
                <Button color="inherit" onClick={() => navigate('/login')}>
                  войдите в систему
                </Button>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Контактная информация */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Контактная информация
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Автор
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {ticket.authorName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {ticket.authorEmail}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Статистика
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommentIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Комментарии: {comments.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachmentIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Файлы: 0
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketDetail;