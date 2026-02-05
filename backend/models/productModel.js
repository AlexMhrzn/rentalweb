const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  beds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  baths: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  parking: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'rented', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
