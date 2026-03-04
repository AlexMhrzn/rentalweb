const express = require('express');
const { sequelize, connectDB } = require('./database/db');
require('./models'); // Ensure all Sequelize associations are registered
// ... (Your Model Imports)
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/user/', require('./routes/route'));
app.use('/api/product/', require('./routes/productRoute'));
app.use('/api/booking/', require('./routes/bookingRoute'));
// ... (Your other routes)

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Home Page from backend!' });
});

const startServer = async () => {
    try {
        await connectDB();
        await sequelize.sync();
        
        // ...removed raw SQL for conversations and messages...

        // IMPORTANT: Only listen if NOT in test mode
        if (process.env.NODE_ENV !== 'test') {
            app.listen(port, () => console.log(`Server running on port ${port}`));
        }
    } catch (err) {
        console.error('Startup error:', err);
    }
};

// Start server logic
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// THE MOST IMPORTANT LINE FOR TESTING
module.exports = app;