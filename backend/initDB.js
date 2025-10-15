const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

// Импортируем модели напрямую, чтобы избежать циклических зависимостей
const { DataTypes } = require('sequelize');

// Определяем модели прямо здесь для инициализации
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  assignedTo: {
    type: DataTypes.STRING,
    defaultValue: 'Не назначен'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  }
});

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Associations
Ticket.hasMany(Comment, { 
  foreignKey: 'ticketId',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Ticket, { 
  foreignKey: 'ticketId'
});

Ticket.hasMany(File, { 
  foreignKey: 'ticketId',
  onDelete: 'CASCADE'
});
File.belongsTo(Ticket, { 
  foreignKey: 'ticketId'
});

User.hasMany(Ticket, { 
  foreignKey: 'authorId'
});
Ticket.belongsTo(User, { 
  foreignKey: 'authorId'
});

User.hasMany(Comment, { 
  foreignKey: 'authorId'
});
Comment.belongsTo(User, { 
  foreignKey: 'authorId'
});

async function initializeDatabase() {
  try {
    console.log('🔄 Starting database initialization with SQLite...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Главный администратор',
      isAdmin: true
    });

    console.log('✅ Initial admin user created:');
    console.log('   📧 Email: admin@example.com');
    console.log('   🔑 Password: admin123');

    // Create sample regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await User.create({
      email: 'user@example.com',
      password: userPassword,
      name: 'Обычный пользователь',
      isAdmin: false
    });

    console.log('✅ Regular user created:');
    console.log('   📧 Email: user@example.com');
    console.log('   🔑 Password: user123');

    // Generate simple ticket number
    const generateTicketNumber = () => {
      const timestamp = Date.now().toString();
      return `#${timestamp.substr(-6)}`; // Просто последние 6 цифр timestamp
    };

    // Create sample tickets
    const sampleTickets = [
      {
        ticketNumber: generateTicketNumber(),
        title: 'Проблема с интернет-соединением',
        description: 'Не работает интернет в кабинете 301 с 10:00 утра. Пропадает пакетная передача данных.',
        department: 'Полярная звезда',
        authorName: 'Иван Иванов',
        authorEmail: 'ivan@example.com',
        assignedTo: 'Петр Сидоров',
        priority: 'high',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 дня
        status: 'open',
        authorId: regularUser.id
      },
      {
        ticketNumber: generateTicketNumber(),
        title: 'Замена картриджа в принтере',
        description: 'В принтере HP LaserJet MFP 135a в отделе бухгалтерии закончился тонер. Нужна срочная замена.',
        department: 'Перспектива', 
        authorName: 'Мария Петрова',
        authorEmail: 'maria@example.com',
        assignedTo: 'Алексей Комаров',
        priority: 'medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 дней
        status: 'in_progress',
        authorId: regularUser.id
      },
      {
        ticketNumber: generateTicketNumber(),
        title: 'Не работает кондиционер',
        description: 'В конференц-зале не включается кондиционер. Воздух не охлаждается, на дисплее ошибка E5.',
        department: 'Созвездие',
        authorName: 'Алексей Сидоров',
        authorEmail: 'alex@example.com',
        assignedTo: 'Сергей Волков',
        priority: 'critical',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // +1 день
        status: 'open',
        authorId: regularUser.id
      },
      {
        ticketNumber: generateTicketNumber(),
        title: 'Ремонт мебели в переговорной',
        description: 'В переговорной комнате №2 сломался механизм регулировки высоты у офисного кресла.',
        department: 'Семейный дом',
        authorName: 'Ольга Николаева',
        authorEmail: 'olga@example.com',
        assignedTo: 'Не назначен',
        priority: 'low',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 дней
        status: 'resolved',
        authorId: regularUser.id
      }
    ];

    const createdTickets = [];
    for (const ticketData of sampleTickets) {
      const ticket = await Ticket.create(ticketData);
      createdTickets.push(ticket);
    }

    console.log('✅ Sample tickets created (4 заявки)');

    // Create sample comments
    for (const ticket of createdTickets) {
      if (ticket.status !== 'open') {
        await Comment.create({
          content: 'Заявка принята в работу. Специалист уже выехал на место.',
          authorName: 'Администратор',
          ticketId: ticket.id,
          authorId: adminUser.id
        });

        if (ticket.status === 'resolved') {
          await Comment.create({
            content: 'Проблема решена. Оборудование работает в штатном режиме.',
            authorName: 'Администратор',
            ticketId: ticket.id,
            authorId: adminUser.id
          });
        }
      }
    }

    console.log('✅ Sample comments created');
    console.log('\n🎉 База данных SQLite успешно инициализирована!');
    console.log('💾 Файл базы данных: database.sqlite');
    console.log('\n📋 Для начала работы:');
    console.log('   1. Запустите бэкенд: npm run dev');
    console.log('   2. Запустите фронтенд: cd ../frontend && npm start');
    console.log('   3. Откройте http://localhost:3000');
    console.log('\n👤 Тестовые пользователи:');
    console.log('   Администратор: admin@example.com / admin123');
    console.log('   Пользователь: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;