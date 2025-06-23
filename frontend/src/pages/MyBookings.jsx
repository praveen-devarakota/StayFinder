import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import AnimatedPopup from '../components/AnimatedPopup';

const MyBookingsWithApi = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelPopupMsg, setCancelPopupMsg] = useState('');
  const navigate = useNavigate();

  const apiEndpoint = `${import.meta.env.VITE_API_URL}/api/bookings/user`;

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your bookings');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(apiEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setBookings(data);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || err.message || 'Unknown error');
        }
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const DetailItem = ({ icon, label, title }) => (
    <div title={title} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors">
      <span className="material-icons text-base text-[#FF5A5F]" aria-hidden="true">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <span className="ml-4 text-lg text-gray-600 font-medium">Loading your bookings...</span>
    </div>
  );

  const cancelBooking = async (bookingId) => {
    setCancelingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookings(bookings => bookings.filter(b => b._id !== bookingId));
      setCancelPopupMsg('Booking cancelled successfully!');
      setShowCancelPopup(true);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to cancel booking.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setCancelingId(null);
    }
  };

  const BookingCard = ({ booking }) => {
    const listing = booking.listing;
    if (!listing) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-icons text-red-500">warning</span>
            <div>
              <h3 className="font-semibold text-red-800">Missing Listing Information</h3>
              <p className="text-red-600">Booking ID: {booking._id}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <article
        tabIndex={0}
        aria-label={`Booking at ${listing.title} from ${formatDate(booking.checkIn)} to ${formatDate(
          booking.checkOut
        )}, for ${booking.numberOfGuests} guest(s). Total price ₹${booking.totalPrice}`}
        className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden mb-8 p-4 md:p-6 flex flex-col gap-4 focus:ring-2 focus:ring-[#FF5A5F] focus:outline-none"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
          {/* Image Section */}
          <div className="md:w-64 w-full h-44 md:h-auto relative overflow-hidden flex-shrink-0 rounded-xl">
            <img
              src={listing.imageUrl || 'https://via.placeholder.com/320x240?text=No+Image'}
              alt={`Image of ${listing.title}`}
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-0 h-full">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-[#FF5A5F] transition-colors leading-tight">
                    {listing.title}
                  </h2>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-[#FF5A5F]">
                      ₹{booking.totalPrice?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Total Price</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
                  <span className="font-semibold text-gray-700">
                    {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <DetailItem 
                    label={`Check In: ${booking.checkInTime}`} 
                    title="Check-in time" 
                  />
                  <DetailItem 
                    label={`Check Out: ${booking.checkOutTime}`} 
                    title="Check-out time" 
                  />
                  <DetailItem
                    label={`${booking.numberOfGuests} Guest${booking.numberOfGuests > 1 ? 's' : ''}`} 
                    title="Number of guests" 
                  />
                  <DetailItem 
                    label={`Booked: ${formatDate(booking.createdAt)}`} 
                    title="Booking created date" 
                  />
                </div>
              </div>
            </div>
            {/* Action Row */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => cancelBooking(booking._id)}
                disabled={cancelingId === booking._id}
                className="px-5 py-2 border border-[#FF5A5F] text-[#FF5A5F] bg-white hover:bg-[#FF5A5F] hover:text-white transition-colors duration-200 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                aria-label="Cancel this booking"
              >
                {cancelingId === booking._id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* AnimatedPopup for cancellation success */}
      <AnimatedPopup
        show={showCancelPopup}
        message={cancelPopupMsg}
        onClose={() => setShowCancelPopup(false)}
        type="success"
        duration={3000}
      />
      {/* Toast for errors */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-red-500 text-2xl">error_outline</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-center max-w-md" role="alert" aria-live="assertive">
            {error}
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="material-icons text-gray-400 text-4xl">inbox</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No bookings yet</h2>
          <p className="text-gray-600 text-center max-w-md" role="status" aria-live="polite">
            When you make your first booking, it will appear here.
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsWithApi;
