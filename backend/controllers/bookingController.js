const BookingRequest = require('../models/bookingRequestModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

exports.createBooking = async (req, res) => {
  try {
    console.log('createBooking called by user:', req.user?.id, 'body:', req.body);
    const userId = req.user?.id;
    const { productId, ownerId, requestedDate, message } = req.body;
    if (!productId || !ownerId) return res.status(400).json({ success: false, message: 'productId and ownerId required' });
    const booking = await BookingRequest.create({ userId, productId, ownerId, requestedDate: requestedDate || null, message: message || null, status: 'pending' });
    return res.json({ success: true, booking });
  } catch (err) {
    console.error('createBooking error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookings = await BookingRequest.findAll({ where: { userId }, include: [{ model: Product }, { model: User, as: 'owner', attributes: ['id','name','email'] }], order: [['createdAt','DESC']] });
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error('getUserBookings error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const bookings = await BookingRequest.findAll({ where: { ownerId }, include: [{ model: Product }, { model: User, as: 'requester', attributes: ['id','name','email'] }], order: [['createdAt','DESC']] });
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error('getOwnerBookings error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const bookingId = req.params.id;
    const { status } = req.body;
    const booking = await BookingRequest.findByPk(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.ownerId !== ownerId) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['approved','rejected','pending'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    booking.status = status;
    await booking.save();
    return res.json({ success: true, booking });
  } catch (err) {
    console.error('updateBookingStatus error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
