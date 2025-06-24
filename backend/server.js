import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import {connectDB} from './config/db.js'; // Adjust the path as necessary
import listingRoutes from './routes/listing.route.js';
import bookingRoutes from './routes/booking.route.js';
import userRoutes from './routes/user.route.js'; 
import adminRoutes from './routes/admin.route.js';

dotenv.config();

const PORT = process.env.PORT || 5000;  // Set default port

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://stayfinder-frontend-v5gf.onrender.com', 'http://localhost:5173'], // replace with your actual frontend domain
  credentials: true  // only if you're using cookies or auth headers
}));

app.use(express.json());

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // First connect to database
    await connectDB();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();