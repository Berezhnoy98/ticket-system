const sequelize = require('./config/database');
const { User, Ticket, Comment } = require('./models');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('🔄 Starting database initialization with SQLite... - initDB.js:7');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established - initDB.js:11');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created - initDB.js:15');

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Главный администратор',
      isAdmin: true
    });

    console.log('✅ Initial admin user created: - initDB.js:26');
    console.log('📧 Email: admin@example.com - initDB.js:27');
    console.log('🔑 Password: admin123 - initDB.js:28');

    // Create sample regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await User.create({
      email: 'user@example.com',
      password: userPassword,
      name: 'Обычный пользователь',
      isAdmin: false
    });

    console.log('✅ Regular user created: - initDB.js:39');
    console.log('📧 Email: user@example.com - initDB.js:40');
    console.log('🔑 Password: user123 - initDB.js:41');

    // Create sample tickets
    const sampleTickets = [
      {
        title: 'Проблема с интернет-соединением',
        description: 'Не работает интернет в кабинете 301 с 10:00 утра. Пропадает пакетная передача данных.',
        department: 'Полярная звезда',
        authorName: 'Иван Иванов',
        authorEmail: 'ivan@example.com',
        status: 'open',
        authorId: regularUser.id
      },
      {
        title: 'Замена картриджа в принтере',
        description: 'В принтере HP LaserJet MFP 135a в отделе бухгалтерии закончился тонер. Нужна срочная замена.',
        department: 'Перспектива', 
        authorName: 'Мария Петрова',
        authorEmail: 'maria@example.com',
        status: 'in_progress',
        authorId: regularUser.id
      },
      {
        title: 'Не работает кондиционер',
        description: 'В конференц-зале не включается кондиционер. Воздух не охлаждается, на дисплее ошибка E5.',
        department: 'Созвездие',
        authorName: 'Алексей Сидоров',
        authorEmail: 'alex@example.com',
        status: 'open',
        authorId: regularUser.id
      },
      {
        title: 'Ремонт мебели в переговорной',
        description: 'В переговорной комнате №2 сломался механизм регулировки высоты у офисного кресла.',
        department: 'Семейный дом',
        authorName: 'Ольга Николаева',
        authorEmail: 'olga@example.com',
        status: 'resolved',
        authorId: regularUser.id
      }
    ];

    const createdTickets = [];
    for (const ticketData of sampleTickets) {
      const ticket = await Ticket.create(ticketData);
      createdTickets.push(ticket);
    }

    console.log('✅ Sample tickets created (4 заявки) - initDB.js:89');

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

    console.log('✅ Sample comments created - initDB.js:112');
    console.log('\n🎉 База данных SQLite успешно инициализирована! - initDB.js:113');
    console.log('💾 Файл базы данных: database.sqlite - initDB.js:114');
    console.log('\n📋 Для начала работы: - initDB.js:115');
    console.log('1. Запустите бэкенд: npm run dev - initDB.js:116');
    console.log('2. Запустите фронтенд: cd ../frontend && npm start - initDB.js:117');
    console.log('3. Откройте http://localhost:3000 - initDB.js:118');
    console.log('\n👤 Тестовые пользователи: - initDB.js:119');
    console.log('Администратор: admin@example.com / admin123 - initDB.js:120');
    console.log('Пользователь: user@example.com / user123 - initDB.js:121');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error: - initDB.js:125', error.message);
    console.error('Full error: - initDB.js:126', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;