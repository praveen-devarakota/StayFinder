import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const searchParams = new URLSearchParams(location.search);
        
        const hasSearchParams = Array.from(searchParams.keys()).length > 0;
        const endpoint = hasSearchParams ? `${import.meta.env.VITE_API_URL}/api/listings/search` : `${import.meta.env.VITE_API_URL}/api/listings`;

        console.log('API Request Params:', Object.fromEntries(searchParams.entries()));
        const res = await axios.get(endpoint, { params: Object.fromEntries(searchParams.entries()) });
        console.log('API Response:', res.data);
        
        setListings(res.data);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setError('Failed to load listings. Please try again later.');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Listings</h1>
      
      {loading && (
        <div className="text-center my-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading listings...</p>
        </div>
      )}

      {error && (
        <div className="text-center my-8">
          <div className="text-red-500 text-lg mb-2">😔</div>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center my-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No listings found</h2>
          <p className="text-gray-600">
            We couldn't find any listings matching your search criteria.
            <br />
            Try adjusting your search filters or browse all listings.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            View All Listings
          </button>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
              onClick={() => navigate(`/listings/${listing._id}`)}
            >
              <img
                src={listing.imageUrl || 'https://via.placeholder.com/400x250'}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="flex flex-col flex-1 justify-between items-start p-4 space-y-2 text-left">
                <div className="flex flex-col items-start space-y-1 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 w-full truncate">{listing.title}</h2>
                  <p className="text-sm text-gray-500 w-full truncate">{listing.address}</p>
                </div>
                <div className="flex items-center justify-between w-full mt-3">
                  <p className="text-red-500 font-semibold">
                    ₹{listing.pricePerNight} <span className="text-gray-500 font-normal">night</span>
                  </p>
                  {listing.guests && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">Up to {listing.guests} guests</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
