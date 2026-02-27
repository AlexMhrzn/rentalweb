const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'products', key: 'id' },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
});

module.exports = Message;
