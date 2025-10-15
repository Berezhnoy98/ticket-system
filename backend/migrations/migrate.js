const { User, Ticket, Comment, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced - migrate.js:8');

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Администратор',
      isAdmin: true
    });

    console.log('Initial admin user created: admin@example.com / admin123 - migrate.js:19');

    // Create sample tickets
    const sampleTickets = [
      {
        title: 'Проблема с интернетом',
        description: 'Не работает интернет в кабинете 301',
        department: 'Полярная звезда',
        authorName: 'Иван Иванов',
        authorEmail: 'ivan@example.com',
        status: 'open'
      },
      {
        title: 'Замена картриджа в принтере',
        description: 'В принтере HP LaserJet закончился тонер',
        department: 'Перспектива', 
        authorName: 'Мария Петрова',
        authorEmail: 'maria@example.com',
        status: 'in_progress'
      }
    ];

    for (const ticketData of sampleTickets) {
      await Ticket.create(ticketData);
    }

    console.log('Sample data created - migrate.js:45');
    process.exit(0);
  } catch (error) {
    console.error('Migration error: - migrate.js:48', error);
    process.exit(1);
  }
}

migrate();