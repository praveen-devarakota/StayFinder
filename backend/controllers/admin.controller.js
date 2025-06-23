import User from '../models/users.js';
import Listing from '../models/listings.js';

// GET /api/admin/users - Get all users with details
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

// POST /api/admin/listings - Create a new listing
export const createListing = async (req, res) => {
  try {
    const { title, description, address, pricePerNight, imageUrl, guests, bedrooms, bathrooms, amenities } = req.body;
    const newListing = new Listing({
      title,
      description,
      address,
      pricePerNight,
      imageUrl,
      guests,
      bedrooms,
      bathrooms,
      amenities
    });
    await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing', details: error.message });
  }
};
