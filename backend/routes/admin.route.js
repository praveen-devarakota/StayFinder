import express from 'express';
import { getAllUsers, createListing } from '../controllers/admin.controller.js';
import  authMiddleware  from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(authMiddleware);
router.use(isAdmin);

// Get all users
router.get('/users', getAllUsers);

// Create a new listing
router.post('/listings', createListing);

export default router; 