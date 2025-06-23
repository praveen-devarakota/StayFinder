import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  user: { // guest who books
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: String,
    required: true,
  },
  checkOutTime: {
    type: String,
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
