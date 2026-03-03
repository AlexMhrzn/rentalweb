const User = require('./userModel');
const Product = require('./productModel');
const BookingRequest = require('./bookingRequestModel');
const Favorite = require('./favoriteModel');
const Message = require('./messageModel');
const Report = require('./reportModel');

// --- Product & User ---
Product.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Product, { foreignKey: 'ownerId' });

// --- Favorites ---
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Favorite, { foreignKey: 'userId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });

// --- Messages ---
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Product.hasMany(Message, { foreignKey: 'productId' });

// --- Booking Requests ---
BookingRequest.belongsTo(User, { foreignKey: 'userId', as: 'requester' });
// UNIQUE ALIAS to prevent crash
BookingRequest.belongsTo(User, { foreignKey: 'ownerId', as: 'bookingOwner' });
BookingRequest.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(BookingRequest, { foreignKey: 'userId', as: 'bookingRequests' });
User.hasMany(BookingRequest, { foreignKey: 'ownerId', as: 'receivedBookingRequests' });
Product.hasMany(BookingRequest, { foreignKey: 'productId' });

// --- Reports ---
Report.belongsTo(User, { foreignKey: 'userId', as: 'reporter' });
User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });

module.exports = { User, Product, BookingRequest, Favorite, Message, Report };