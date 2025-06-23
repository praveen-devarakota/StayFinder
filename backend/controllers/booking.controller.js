import Booking from '../models/bookings.js';
import Listing from '../models/listings.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      listingId,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      numberOfGuests,
      totalPrice
    } = req.body;

    // Validate required fields
    if (!listingId || !checkIn || !checkOut || !checkInTime || !checkOutTime || !numberOfGuests || !totalPrice) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Find listing to extract host
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const hostId = listing.owner || listing.host || listing.user; // Adjust field based on your listing schema

    // Create booking
    const newBooking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      numberOfGuests,
      totalPrice
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking created successfully.', booking: newBooking });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
};

// Get all bookings of a logged-in user (Guest View)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('User Bookings Error:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
};



// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Only user who made the booking can cancel
    if (!booking.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({ message: 'Booking canceled successfully.' });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ message: 'Server error while cancelling booking.' });
  }
};
