const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// Send a message to another user (optionally about a product)
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, productId, text } = req.body;
    if (!receiverId || !text) return res.status(400).json({ success: false, message: 'receiverId and text are required' });

    // Ensure receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    // Optionally ensure product exists
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const message = await Message.create({ senderId, receiverId, productId: productId || null, text });
    return res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get all messages involving current user (to build conversation list client-side)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.findAll({
      where: { [require('sequelize').Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] },
        { model: Product },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Get messages between current user and another user
const getConversationWith = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = Number(req.params.userId);
    if (!otherId) return res.status(400).json({ success: false, message: 'userId required' });
    const messages = await Message.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] },
        { model: Product },
      ],
      order: [['createdAt', 'ASC']],
    });
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

module.exports = { sendMessage, getConversations, getConversationWith };
