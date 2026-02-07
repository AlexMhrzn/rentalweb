const express=require('express');
const { sequelize,connectDB } = require('./database/db');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

Product.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Product, { foreignKey: 'ownerId' });
const app=express();
const port=3000;

const cors=require('cors');
app.use(cors({
    origin:'http://localhost:5173',
    // methods:['GET','POST','PUT','DELETE'],
    credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user/',require('./routes/route'));
app.use('/api/product/',require('./routes/productRoute'));


app.get('/',(req,res)=>{
    res.json({message:'Welcome to the Home Page from backend! change vayo wow'});
});


const startServer=async()=>{
    await connectDB();
    await sequelize.sync({ alter:true });
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
}

startServer();