const { Op } = require('sequelize');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAllProduct = async (req, res) => {
  try {
    const { city, category, q, minPrice, maxPrice, status } = req.query;
    const where = {};
    if (status && ["active","pending","rejected","rented"].includes(status)) {
      where.status = status;
    }
    // city and category - allow partial, case-insensitive matches
    if (city && city.trim()) where.city = { [Op.iLike]: `%${city.trim()}%` };
    if (category && category.trim()) where.category = { [Op.iLike]: `%${category.trim()}%` };
    // price range
    if (minPrice || maxPrice) {
      const priceCond = {};
      if (minPrice && !Number.isNaN(Number(minPrice))) priceCond[Op.gte] = Number(minPrice);
      if (maxPrice && !Number.isNaN(Number(maxPrice))) priceCond[Op.lte] = Number(maxPrice);
      if (Object.keys(priceCond).length) where.price = priceCond;
    }
    // free text q - search title, location, area, city
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: term } },
        { location: { [Op.iLike]: term } },
        { area: { [Op.iLike]: term } },
        { city: { [Op.iLike]: term } },
      ];
    }
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
    
    // Get image from uploaded file or use placeholder
    let imageUrl = 'https://via.placeholder.com/300x200?text=Property';
    if (req.file) {
      imageUrl = `uploads/${req.file.filename}`;
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
      image: imageUrl,
      status: 'pending',
      ownerId,
    });
    return res.status(201).json({ success: true, message: 'Property submitted for approval', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { title, description, price, location, city, area, beds, baths, parking, category } = req.body;
    
    console.log('updateProduct called:', { id, ownerId });
    console.log('req.file:', req.file ? { fname: req.file.originalname, path: req.file.filename } : 'NO FILE');

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Allow owner or admin to edit
    if (product.ownerId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this property' });
    }

    // Update the product
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseInt(price, 10);
    if (location) updateData.location = location;
    if (city) updateData.city = city;
    if (area) updateData.area = area;
    if (beds) updateData.beds = parseInt(beds, 10);
    if (baths) updateData.baths = parseInt(baths, 10);
    if (parking !== undefined) updateData.parking = !!parking;
    if (category) updateData.category = category;
    
    // Handle image update - only if new file is uploaded
    if (req.file) {
      console.log('Image file found, updating with:', `uploads/${req.file.filename}`);
      updateData.image = `uploads/${req.file.filename}`;
    } else {
      console.log('No image file in request');
    }
    
    console.log('updateData:', updateData);
    await product.update(updateData);
    return res.json({ success: true, message: 'Property updated successfully', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Allow owner or admin to delete
    if (product.ownerId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this property' });
    }

    // Delete the product
    await product.destroy();
    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting product', error: error.message });
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

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // product id
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Property not found' });

    const Favorite = require('../models/favoriteModel');
    const [fav, created] = await Favorite.findOrCreate({ where: { userId, productId: product.id } });
    return res.json({ success: true, message: created ? 'Added to favorites' : 'Already in favorites', favorite: fav });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // product id
    const Favorite = require('../models/favoriteModel');
    const fav = await Favorite.findOne({ where: { userId, productId: id } });
    if (!fav) return res.status(404).json({ success: false, message: 'Favorite not found' });
    await fav.destroy();
    return res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const Favorite = require('../models/favoriteModel');
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [{ model: Product }],
      order: [['createdAt', 'DESC']],
    });
    const products = favorites.map((f) => f.Product).filter(Boolean);
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

module.exports = {
  getAllProduct,
  getProductsByOwner,
  getPendingApprovals,
  approveProduct,
  rejectProduct,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  getAdminStats,
  addFavorite,
  removeFavorite,
  getMyFavorites,
};