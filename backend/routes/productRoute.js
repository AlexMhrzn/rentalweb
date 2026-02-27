const express = require('express').Router();

const {
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
} = require('../controllers/productController');
const authGuard = require('../helpers/authguagrd');
const isAdmin = require('../helpers/isAdmin');
const fileUpload = require('../helpers/multer');

express.get('/products', getAllProduct);
express.get('/pending', authGuard, isAdmin, getPendingApprovals);
express.get('/admin/stats', authGuard, isAdmin, getAdminStats);
express.get('/my', authGuard, getProductsByOwner);
// Favorites
express.post('/favorite/:id', authGuard, addFavorite);
express.delete('/favorite/:id', authGuard, removeFavorite);
express.get('/favorite/my', authGuard, getMyFavorites);
express.post('/approve/:id', authGuard, isAdmin, approveProduct);
express.post('/reject/:id', authGuard, isAdmin, rejectProduct);
express.get('/:id', getProductById);
express.post('/', authGuard, fileUpload('image'), createProduct);
express.put('/:id', authGuard, fileUpload('image'), updateProduct);
express.delete('/:id', authGuard, deleteProduct);

module.exports = express;