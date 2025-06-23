import Listing from '../models/listings.js';

// GET /listings
export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

// GET /listings/:id
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid listing ID format' });
    }
    res.status(500).json({ 
      error: 'Failed to fetch listing',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// POST /listings
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      pricePerNight,
      imageUrl,
      guests,
      bedrooms,
      bathrooms,
      amenities
    } = req.body;

    // Validate required fields
    if (!title || !pricePerNight) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

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

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (err) {
    console.error('Error creating listing:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      error: 'Failed to create listing',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const searchListings = async (req, res) => {
  try {
    const { location, guests } = req.query;

    // Start with an empty query object
    const query = {};
    const conditions = [];

    // --- Guest Filter (with validation) ---
    if (guests) {
      const guestCount = parseInt(guests, 10);
      if (isNaN(guestCount) || guestCount < 1) {
        return res.status(400).json({ error: 'Invalid guest count. Must be a positive number.' });
      }
      // Add guest condition. Using 'guests' field as per your schema.
      conditions.push({ guests: { $gte: guestCount } });
    }

    // --- Location Filter ---
    if (typeof location === 'string' && location.trim() !== '') {
      const locationWords = location.split(/[\s,]+/).filter(Boolean);
      if (locationWords.length > 0) {
        const addressFilters = locationWords.map(word => ({
          address: { $regex: word, $options: 'i' }
        }));
        // Add location conditions wrapped in an $or
        conditions.push({ $or: addressFilters });
      }
    }

    // If there are any conditions, combine them with $and
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const listings = await Listing.find(query);
    res.json(listings);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

