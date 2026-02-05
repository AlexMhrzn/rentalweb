const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAllProduct = async (req, res) => {
  try {
    const { city, category } = req.query;
    const where = { status: 'active' };
    if (city) where.city = city;
    if (category) where.category = category;

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

const getProductsByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const products = await Product.findAll({
      where: { ownerId },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching approvals', error: error.message });
  }
};

const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.update({ status: 'active', verified: true });
    return res.json({ success: true, message: 'Product approved', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error approving product', error: error.message });
  }
};

const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.update({ status: 'rejected' });
    return res.json({ success: true, message: 'Product rejected', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejecting product', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { title, description, price, location, city, area, beds, baths, parking, category } = req.body;
    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required' });
    }
    const product = await Product.create({
      title,
      description: description || '',
      price: parseInt(price, 10),
      location: location || '',
      city: city || '',
      area: area || '',
      beds: beds ? parseInt(beds, 10) : 1,
      baths: baths ? parseInt(baths, 10) : 1,
      parking: !!parking,
      category: category || 'Room',
      image: req.body.image || 'https://via.placeholder.com/300x200?text=Property',
      status: 'pending',
      ownerId,
    });
    return res.status(201).json({ success: true, message: 'Property submitted for approval', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalOwners = await User.count(); // For now count all non-admin; could add owner mode later
    const activeListings = await Product.count({ where: { status: 'active' } });
    const pendingCount = await Product.count({ where: { status: 'pending' } });
    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalOwners: totalUsers, // Same for now
        activeListings,
        monthlyRevenue: 2450000, // Placeholder
        pendingApprovals: pendingCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  getAllProduct,
  getProductsByOwner,
  getPendingApprovals,
  approveProduct,
  rejectProduct,
  createProduct,
  getAdminStats,
};
