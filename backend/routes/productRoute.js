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
} = require('../controllers/productController');
const authGuard = require('../helpers/authguagrd');
const isAdmin = require('../helpers/isAdmin');

express.get('/products', getAllProduct);
express.get('/my', authGuard, getProductsByOwner);
express.get('/pending', authGuard, isAdmin, getPendingApprovals);
express.get('/:id', getProductById);
express.post('/approve/:id', authGuard, isAdmin, approveProduct);
express.post('/reject/:id', authGuard, isAdmin, rejectProduct);
express.post('/', authGuard, createProduct);
express.put('/:id', authGuard, updateProduct);
express.delete('/:id', authGuard, deleteProduct);
express.get('/admin/stats', authGuard, isAdmin, getAdminStats);

module.exports = express;