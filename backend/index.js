const express=require('express');
const { sequelize,connectDB } = require('./database/db');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Favorite = require('./models/favoriteModel');
const Message = require('./models/messageModel');
const BookingRequest = require('./models/bookingRequestModel');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

Product.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Product, { foreignKey: 'ownerId' });
// Favorites associations
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Favorite, { foreignKey: 'userId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });
// Messages associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Product.hasMany(Message, { foreignKey: 'productId' });
// Booking associations
BookingRequest.belongsTo(User, { foreignKey: 'userId', as: 'requester' });
BookingRequest.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
BookingRequest.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(BookingRequest, { foreignKey: 'userId', as: 'bookingRequests' });
User.hasMany(BookingRequest, { foreignKey: 'ownerId', as: 'receivedBookingRequests' });
Product.hasMany(BookingRequest, { foreignKey: 'productId' });
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
app.use('/api/messages', require('./routes/messageRoute'));
app.use('/api/conversation', require('./routes/pgConversationRoute'));
app.use('/api/message', require('./routes/pgMessageRoute'));
app.use('/api/booking', require('./routes/bookingRoute'));


app.get('/',(req,res)=>{
    res.json({message:'Welcome to the Home Page from backend! change vayo wow'});
});


const startServer=async()=>{
    await connectDB();
        await sequelize.sync({ alter:true });
        // ensure pg-based messaging tables exist (conversations, messages)
        try {
            const { Pool } = require('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 5432,
            });
            const client = await pool.connect();
            try {
                await client.query(`CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    property_id INTEGER,
                    owner_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`);
                await client.query(`CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                    sender_id INTEGER NOT NULL,
                    message_text TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`);
                console.log('Ensured conversations/messages tables exist');
            } finally { client.release(); pool.end(); }
        } catch (err) {
            console.error('Failed to ensure pg messaging tables:', err.message || err);
        }
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
}

startServer();