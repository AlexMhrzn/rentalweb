const express = require('express');
const router = express.Router();
const authGuard = require('../helpers/authguagrd');
const bookingController = require('../controllers/bookingController');

router.post('/request', authGuard, bookingController.createBooking);
router.get('/user', authGuard, bookingController.getUserBookings);
router.get('/owner', authGuard, bookingController.getOwnerBookings);
router.put('/:id/status', authGuard, bookingController.updateBookingStatus);

module.exports = router;