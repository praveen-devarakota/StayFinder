import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  address: String,
  pricePerNight: {
    type: Number,
    required: true
  },
  imageUrl: String,
  guests: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String]
}, { timestamps: true });

export default mongoose.model('Listing', listingSchema);
