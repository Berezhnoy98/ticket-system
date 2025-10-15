const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  }
}, {
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['department']
    }
  ]
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

// Associations
Ticket.hasMany(Comment, { 
  foreignKey: 'ticketId',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Ticket, { 
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

module.exports = {
  User,
  Ticket,
  Comment,
  sequelize
};