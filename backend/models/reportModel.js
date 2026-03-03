const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    tableName: 'reports',
    timestamps: true,
});

module.exports = Report;
