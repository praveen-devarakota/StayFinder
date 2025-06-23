import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Toast from '../components/Toast';
import AnimatedPopup from '../components/AnimatedPopup';

function SingleListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [showCheckInTimeDropdown, setShowCheckInTimeDropdown] = useState(false);
  const [showCheckOutTimeDropdown, setShowCheckOutTimeDropdown] = useState(false);
  const [guests, setGuests] = useState(1);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupMsg, setConfirmPopupMsg] = useState('');

  // Generate all possible time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const time = new Date();
      time.setHours(hour, 0, 0, 0);
      slots.push(time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
    return slots;
  };

  // Filter time slots based on current time + 1 hour, up to 10 PM
  const getAvailableTimeSlots = () => {
    const currentTime = new Date();
    const minTime = new Date(currentTime);
    minTime.setHours(currentTime.getHours() + 1);
    
    // If current time is 10 PM or later, return empty array
    if (currentTime.getHours() >= 22) {
      return [];
    }
    
    return generateTimeSlots().filter(timeSlot => {
      const slotTime = new Date();
      const [time, period] = timeSlot.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      slotTime.setHours(hours, parseInt(minutes) || 0, 0, 0);
      return slotTime > minTime && slotTime.getHours() <= 22;
    });
  };

  // Check if today should be disabled for check-in
  const isTodayDisabled = () => {
    const currentTime = new Date();
    return currentTime.getHours() >= 22;
  };

  // Get minimum date for check-in (tomorrow if today is past 10 PM)
  const getMinCheckInDate = () => {
    if (isTodayDisabled()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return new Date();
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle time selection
  const handleTimeSelection = (time, type) => {
    if (type === 'checkIn') {
      setCheckInTime(time);
      setShowCheckInTimeDropdown(false);
    } else {
      setCheckOutTime(time);
      setShowCheckOutTimeDropdown(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('Invalid listing ID');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/listings/${id}`);
        setListing(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.error || 'Failed to fetch listing details');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.time-dropdown-container') && !event.target.closest('.guests-dropdown-container')) {
        setShowCheckInTimeDropdown(false);
        setShowCheckOutTimeDropdown(false);
        setShowGuestsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    setCheckInTime('');
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    } else {
      setCheckOutDate(null);
    }
  };

  const handleCheckOutChange = (date) => {
    setCheckOutDate(date);
    setCheckOutTime('');
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const subtotal = nights * (listing?.pricePerNight || 0);
    const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
    const taxes = Math.round(subtotal * 0.18); // 18% taxes
    return {
      nights,
      subtotal,
      serviceFee,
      taxes,
      total: subtotal + serviceFee + taxes
    };
  };

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to make a booking');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleReserve = async () => {
    if (!checkToken()) return;
    try {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (!checkInDate || !checkOutDate || !checkInTime || !checkOutTime) {
        alert('Please select check-in/check-out dates and times');
        return;
      }
      const costBreakdown = calculateTotal();
      if (costBreakdown.total <= 0) {
        alert('Invalid booking total');
        return;
      }
      const bookingData = {
        listingId: id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        numberOfGuests: guests,
        totalPrice: costBreakdown.total
      };
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/bookings`,
          bookingData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data) {
          setConfirmPopupMsg('Booking confirmed!');
          setShowConfirmPopup(true);
          setTimeout(() => setShowConfirmPopup(false), 3000);
          setTimeout(() => navigate('/my-bookings'), 1000);
          return;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response?.status === 400) {
          alert(error.response.data.message || 'Please check all booking details.');
        } else {
          alert('Server error while creating booking. Please try again later.');
        }
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your perfect stay...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">This listing might have been removed or doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            ← Explore Other Properties
          </button>
        </div>
      </div>
    );
  }

  const costBreakdown = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AnimatedPopup for booking confirmation */}
      <AnimatedPopup
        show={showConfirmPopup}
        message={confirmPopupMsg}
        onClose={() => setShowConfirmPopup(false)}
        type="success"
        duration={3000}
      />
      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute top-6 right-8 md:top-10 md:right-16 z-50">
            <button
              onClick={e => { e.stopPropagation(); setLightboxOpen(false); }}
              className="text-white text-4xl md:text-5xl font-bold focus:outline-none hover:text-gray-300 transition-colors"
              aria-label="Close image preview"
            >
              &times;
            </button>
          </div>
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl border-4 border-white transition-transform duration-300"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {listing.address}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.8 (127 reviews)
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          {/* Modern Airbnb-style photo collage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
            {/* Large image on the left */}
            <div className="md:col-span-2 row-span-2 h-64 md:h-80 relative">
              <img
                src={listing.images?.[0] || listing.imageUrl || 'https://via.placeholder.com/800x600'}
                alt={listing.title}
                className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => {
                  setLightboxImg(listing.images?.[0] || listing.imageUrl || 'https://via.placeholder.com/800x600');
                  setLightboxOpen(true);
                }}
              />
            </div>
            {/* 2x2 grid of next 4 images on the right (desktop), stacked on mobile */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-64 md:h-80">
              {[1,2,3,4].map((i) => {
                const imgSrc = listing.images?.[i] || listing.imageUrl || 'https://via.placeholder.com/400x300';
                return (
                  <div key={i} className="relative w-full h-full">
                    <img
                      src={imgSrc}
                      alt={`Property view ${i+1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => {
                        setLightboxImg(imgSrc);
                        setLightboxOpen(true);
                      }}
                    />
                    {/* Show all photos overlay on last image if there are more images */}
                    {(i === 4 && listing.images && listing.images.length > 5) ? (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all rounded-lg"
                          onClick={() => {
                            setLightboxImg(imgSrc);
                            setLightboxOpen(true);
                          }}>
                        <span className="text-white font-medium flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Show all photos
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Entire place hosted by Sarah</h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>{listing.guests || 4} guests</span>
                    <span>•</span>
                    <span>{listing.bedrooms || 2} bedrooms</span>
                    <span>•</span>
                    <span>{listing.bathrooms || 2} bathrooms</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">₹{listing.pricePerNight?.toLocaleString()}</p>
                  <p className="text-gray-500">per night</p>
                </div>
              </div>

              {/* Host Avatar */}
              <div className="flex items-center p-4 border border-gray-200 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  S
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah</p>
                  <p className="text-gray-500 text-sm">Superhost • 5 years hosting</p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">What makes this place special</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 text-blue-600 mr-4 mt-1">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enhanced Clean</h4>
                    <p className="text-gray-600 text-sm">This host committed to enhanced cleaning protocol.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 text-blue-600 mr-4 mt-1">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Self check-in</h4>
                    <p className="text-gray-600 text-sm">Check yourself in with the smart lock.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 text-blue-600 mr-4 mt-1">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Free cancellation</h4>
                    <p className="text-gray-600 text-sm">Cancel up to 24 hours before check-in.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About this space</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {listing.description || "Experience the perfect blend of comfort and luxury in this beautifully designed space. Located in the heart of the city, this property offers modern amenities and stylish interiors that will make your stay unforgettable."}
              </p>
              <button className="text-blue-600 font-medium hover:underline">Show more</button>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(listing.amenities || ['WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'TV', 'Parking', 'Pool', 'Gym']).slice(0, 8).map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-6 h-6 text-gray-600 mr-3">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
              {listing.amenities && listing.amenities.length > 8 && (
                <button className="mt-4 px-6 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors font-medium">
                  Show all {listing.amenities.length} amenities
                </button>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{listing.pricePerNight?.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1">night</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-500 ml-1">(127)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Date Selection */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Check-in Date */}
                      <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            CHECK-IN
                          </div>
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={checkInDate}
                            onChange={handleCheckInChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm"
                            dateFormat="MMM dd"
                            placeholderText="Select date"
                            minDate={getMinCheckInDate()}
                            customInput={
                              <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm cursor-pointer"
                                readOnly
                              />
                            }
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Check-out Date */}
                      <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            CHECK-OUT
                          </div>
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={checkOutDate}
                            onChange={handleCheckOutChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm"
                            dateFormat="MMM dd"
                            placeholderText="Select date"
                            minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : null}
                            customInput={
                              <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm cursor-pointer"
                                readOnly
                              />
                            }
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  {checkInDate && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Check-in Time */}
                        <div className="relative time-dropdown-container">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Check-in time
                            </div>
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setShowCheckInTimeDropdown(!showCheckInTimeDropdown)}
                              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm cursor-pointer flex items-center justify-between ${
                                checkInTime 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                                  : 'border-gray-300 text-gray-900'
                              }`}
                              aria-label="Select check-in time"
                            >
                              <span>{checkInTime || 'Select time'}</span>
                              <svg className={`w-4 h-4 transition-transform duration-200 ${showCheckInTimeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {/* Time Dropdown */}
                            {showCheckInTimeDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out transform origin-top">
                                <div className="max-h-48 overflow-y-auto">
                                  {availableTimeSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-1 p-2">
                                      {availableTimeSlots.map((time, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleTimeSelection(time, 'checkIn')}
                                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-150 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                                            checkInTime === time 
                                              ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300' 
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {time}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                      No available times today
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Check-out Time */}
                        {checkOutDate && (
                          <div className="relative time-dropdown-container">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Check-out time
                              </div>
                            </label>
                            <div className="relative">
                              <button
                                onClick={() => setShowCheckOutTimeDropdown(!showCheckOutTimeDropdown)}
                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white shadow-sm cursor-pointer flex items-center justify-between ${
                                  checkOutTime 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                                    : 'border-gray-300 text-gray-900'
                                }`}
                                aria-label="Select check-out time"
                              >
                                <span>{checkOutTime || 'Select time'}</span>
                                <svg className={`w-4 h-4 transition-transform duration-200 ${showCheckOutTimeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Time Dropdown */}
                              {showCheckOutTimeDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out transform origin-top">
                                  <div className="max-h-48 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-1 p-2">
                                      {generateTimeSlots().map((time, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleTimeSelection(time, 'checkOut')}
                                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-150 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                                            checkOutTime === time 
                                              ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300' 
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {time}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guests */}
                  <div className="relative guests-dropdown-container border border-gray-300 rounded-xl p-3 bg-white shadow-sm transition-all duration-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      GUESTS
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowGuestsDropdown(v => !v)}
                      className={`w-full px-4 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 bg-white text-sm flex items-center justify-between ${showGuestsDropdown ? 'border-blue-500' : 'border-gray-300'}`}
                      aria-label="Select number of guests"
                    >
                      <span className="font-medium text-gray-900">{guests} guest{guests > 1 ? 's' : ''}</span>
                      <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${showGuestsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showGuestsDropdown && (
                      <div className="absolute z-20 left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-200 ease-in-out origin-top animate-dropdown-open">
                        <div className="grid grid-cols-2 gap-2 p-2 max-h-40 overflow-y-auto">
                          {Array.from({ length: listing.guests || 4 }, (_, i) => i + 1).map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => { setGuests(num); setShowGuestsDropdown(false); }}
                              className={`px-3 py-2 rounded-lg text-sm transition-all duration-150 focus:outline-none focus:bg-blue-100 hover:bg-gray-100 ${
                                guests === num ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300' : 'text-gray-700'
                              }`}
                              aria-label={`Select ${num} guest${num > 1 ? 's' : ''}`}
                            >
                              {num} guest{num > 1 ? 's' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cost Breakdown */}
                  {checkInDate && checkOutDate && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>₹{listing.pricePerNight?.toLocaleString()} × {costBreakdown.nights} nights</span>
                        <span>₹{costBreakdown.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>₹{costBreakdown.serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes</span>
                        <span>₹{costBreakdown.taxes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{costBreakdown.total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleReserve}
                    disabled={!checkInDate || !checkOutDate}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {checkInDate && checkOutDate ? 'Reserve' : 'Check availability'}
                  </button>
                  <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox fade-in animation */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}

export default SingleListing;