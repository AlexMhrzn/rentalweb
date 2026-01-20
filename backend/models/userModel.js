const {DataTypes}=require('sequelize');
const {sequelize}=require('../database/db');

const User=sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        vaildate:{
            isEmail:true,
        }
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
},
    {
        tableName:'users',
        timestamps:true,
    }

);

module.exports=User;