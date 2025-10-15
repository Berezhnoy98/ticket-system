# 🚀 Инструкции по деплою

## Вариант 1: Локальная разработка

### Быстрый старт:
```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/ticket-system.git
cd ticket-system

# Установите все зависимости
npm run install:all

# Инициализируйте базу данных
cd backend && npm run init-db

# Запустите оба сервера
npm run dev