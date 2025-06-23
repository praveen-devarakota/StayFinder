import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking
} from '../controllers/booking.controller.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a booking (only logged-in users)
router.post('/', authMiddleware, createBooking);

// Get bookings made by the user (Guest)
router.get('/user', authMiddleware, getUserBookings);

// Cancel a booking by ID (only by the user who booked)
router.delete('/:id', authMiddleware, cancelBooking);

export default router;
