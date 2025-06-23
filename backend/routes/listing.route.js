import express from 'express';
import { createListing, getAllListings, getListingById, searchListings } from '../controllers/listing.controller.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/search', searchListings);
router.get('/:id', getListingById);
router.post('/', createListing);

export default router;
