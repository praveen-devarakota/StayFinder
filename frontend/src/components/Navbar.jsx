import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  FaSearch,
  FaUserCircle,
  FaUser,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debounce from 'lodash/debounce';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Mock data for locations
const mockLocations = [
  { id: 1, name: "Kochi, Kerala", type: "City" },
  { id: 2, name: "Coimbatore, Tamilnadu", type: "City" },
  { id: 3, name: "Amaravathi, Andhra pradesh", type: "City" },
  { id: 4, name: "Banglore, Karnataka", type: "City" },
  { id: 5, name: "vijayawada, Andhra pradesh", type: "City" },
  { id: 6, name: "Hyderabad, Telangana", type: "City" },
  { id: 7, name: "Eluru, Andhra pradesh", type: "City" },
  { id: 8, name: "Chennai, Tamilnadu", type: "City" },
  { id: 8, name: "Delhi, New Delhi", type: "City" },
  { id: 8, name: "Aamchi, Mumbai", type: "City" },
  { id: 8, name: "Dwaraka, Mumbai", type: "City" },
];

const initialGuests = { adults: 1, children: 0, infants: 0 };

const Navbar = () => {
  const [activeField, setActiveField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const isSearchExpanded = !!activeField;
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: initialGuests,
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const locationInputRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const locationRef = useRef(null);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const guestsRef = useRef(null);
  const checkInButtonRef = useRef();

  // Add state for keyboard navigation
  const [locationInput, setLocationInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLocationInput = (value) => {
    setLocationInput(value);
    if (value) {
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1); // Reset highlight
    } else {
      setFilteredLocations([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show/hide location dropdown
  useEffect(() => {
    setShowLocationDropdown(
      !!searchData.location && locationSuggestions.length > 0 && activeField === "location"
    );
  }, [locationSuggestions, searchData.location, activeField]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setActiveField(null);
        setShowLocationDropdown(false);
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility for closing dropdowns
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActiveField(null);
        setShowLocationDropdown(false);
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Keyboard navigation for dropdown
  const handleLocationKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredLocations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLocations.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredLocations[selectedIndex]) {
        handleLocationSelect(filteredLocations[selectedIndex]);
      } else if (filteredLocations.length === 1) {
        handleLocationSelect(filteredLocations[0]);
      }
    }
  };

  // Helper functions
  const handleLocationSelect = (location) => {
    setLocationInput(location.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSearchData((prev) => ({ ...prev, location: location.name }));

    // Wait for dropdown to close and DOM to update
    setTimeout(() => {
      if (checkInButtonRef.current) {
        checkInButtonRef.current.focus();
        checkInButtonRef.current.click();
      }
    }, 100);
  };

  const updateGuestCount = (type, op) => {
    setSearchData((prev) => {
      const guests = { ...prev.guests };
      if (op === "increase") guests[type]++;
      else if (op === "decrease") {
        if (type === "adults") guests[type] = Math.max(1, guests[type] - 1);
        else guests[type] = Math.max(0, guests[type] - 1);
      }
      return { ...prev, guests };
    });
  };

  const getTotalGuests = () => {
    const { adults, children, infants } = searchData.guests;
    return adults + children + infants;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const validateDates = () => {
    if (searchData.checkIn && searchData.checkOut) {
      const checkIn = new Date(searchData.checkIn);
      const checkOut = new Date(searchData.checkOut);
      if (checkOut <= checkIn) {
        setSearchError("Check-out date must    after check-in date");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchError(null);
    
    if (!validateDates()) {
      return;
    }

    setIsSearching(true);
    
    const searchParams = new URLSearchParams();
    
    if (searchData.location) {
      searchParams.set('location', searchData.location.trim());
    }
    
    if (searchData.checkIn) {
      searchParams.set('checkIn', searchData.checkIn);
    }
    
    if (searchData.checkOut) {
      searchParams.set('checkOut', searchData.checkOut);
    }
    
    const totalGuests = getTotalGuests();
    if (totalGuests > 1) {
      searchParams.set('guests', totalGuests);
    }
    
    try {
      // Navigate to search results
      navigate(`/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
      
      // Reset search state
      setSearchData({
        location: "",
        checkIn: "",
        checkOut: "",
        guests: initialGuests,
      });
      
      setActiveField(null);
      setShowLocationDropdown(false);
      setShowGuestDropdown(false);
    } catch (error) {
      setSearchError("An error occurred while searching. Please try again.");
      console.error('Search error:', error);  
    } finally {
      setIsSearching(false);
    }
  };

  const getFieldClasses = (fieldName) => {
    const isActive = activeField === fieldName;
    const isHovered = hoveredField === fieldName;
    return `w-full text-left px-6 py-3 rounded-full outline-none transition-all duration-1000 ease-in-out transform ${
      isActive
        ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] translate-x-0 opacity-100'
        : isHovered
        ? 'bg-gray-200 translate-x-4 opacity-80'
        : 'hover:bg-gray-200 translate-x-4 opacity-80'
    }`;
  };

  const getFieldBackground = (fieldName) => {
    if (!isSearchExpanded) return '';
    return activeField === fieldName ? 'bg-white' : 'bg-transparent';
  };
  const getSearchBarBackground = () => {
  return isSearchExpanded ? 'bg-gray-200' : '';
  };

  const handleLocationConfirm = () => {
    // Focus and open the check-in calendar
    checkInButtonRef.current?.focus();
    checkInButtonRef.current?.click();
  };

  // Handle check-in change and clear check-out if needed
  const handleCheckInChange = (date) => {
    setSearchData((prev) => ({
      ...prev,
      checkIn: date,
      checkOut:
        prev.checkOut && new Date(prev.checkOut) <= date ? null : prev.checkOut,
    }));
    setTimeout(() => checkOutRef.current?.focus(), 0);
  };

  // Handle check-out change
  const handleCheckOutChange = (date) => {
    setSearchData((prev) => ({
      ...prev,
      checkOut: date,
    }));
    setTimeout(() => guestsRef.current?.focus(), 0);
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#f8f8f8] rounded-lg sticky top-0 z-50">
      <header className="flex items-center justify-between w-full px-6 py-4">
        {/* logo */}
        <div className="flex items-center gap-2 text-xl font-semibold hover:cursor-pointer text-pink-600" onClick={() => {
          // Clear search bar state
          setLocationInput("");
          setFilteredLocations([]);
          setSelectedIndex(-1);
          setShowDropdown(false);
          setSearchData({
            location: "",
            checkIn: "",
            checkOut: "",
            guests: initialGuests,
          });
          navigate('/');
        }}>
          StayFinder
        </div>
        {/* search container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex-1 max-w-3xl mx-6">
          <div className={`search-container flex items-center  relative rounded-full transition-all duration-500 ${getSearchBarBackground()}`}>
            
              {/* Where */}
              <div 
                className={`flex relative rounded-full transition-colors duration-500 ${getFieldBackground('location')}`}
                onMouseEnter={() => setHoveredField('location')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <div 
                  className={getFieldClasses('location')}
                  onClick={() => {
                    setActiveField('location');
                    setShowLocationDropdown(true);
                    setShowGuestDropdown(false);
                  }}
                >
                  <div className="text-xs font-semibold text-gray-700">Where</div>
                  <div className="flex items-center">
                    <div className="relative">
                      <input
                        ref={locationInputRef}
                        type="text"
                        value={locationInput}
                        onChange={e => handleLocationInput(e.target.value)}
                        onKeyDown={handleLocationKeyDown}
                        onFocus={() => locationInput && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                        placeholder="Search destinations"
                        className="w-full text-base bg-transparent outline-none focus:outline-none text-gray-900 placeholder-gray-400"
                        aria-label="Search destinations"
                        role="combobox"
                        aria-expanded={showDropdown}
                        aria-controls="location-suggestion-list"
                        aria-activedescendant={selectedIndex >= 0 ? `location-suggestion-${selectedIndex}` : undefined}
                      />
                      {showDropdown && filteredLocations.length > 0 && (
                        <ul
                          id="location-suggestion-list"
                          className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 max-h-72 overflow-y-auto animate-fadeIn"
                          role="listbox"
                        >
                          {filteredLocations.map((location, idx) => (
                            <li
                              key={location.id}
                              id={`location-suggestion-${idx}`}
                              role="option"
                              aria-selected={selectedIndex === idx}
                              className={`px-6 py-3 cursor-pointer ${
                                idx === selectedIndex ? "bg-[#FFF8F2] text-[#FF385C]" : "hover:bg-gray-100"
                              }`}
                              onMouseDown={() => handleLocationSelect(location)}
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-sm text-gray-500">{location.type}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`w-px h-8 bg-gray-200 transition-colors duration-500 ${
                hoveredField === 'location' || hoveredField === 'checkIn' ? 'opacity-0' : 'opacity-100'
              }`} />

              {/* Check in */}
              <div 
                className={`relative rounded-full transition-colors duration-500 ${getFieldBackground('checkIn')}`}
                onMouseEnter={() => setHoveredField('checkIn')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <button
                  ref={checkInButtonRef}
                  type="button"
                  onClick={() => {
                    setActiveField("checkIn");
                    setShowLocationDropdown(false);
                    setShowGuestDropdown(false);
                  }}
                  className={getFieldClasses('checkIn')}
                >
                  <div className="text-xs font-semibold text-gray-700">Check in</div>
                  <div className={`text-base ${
                    searchData.checkIn ? "text-gray-900" : "text-gray-400"
                  }`}>
                    {formatDate(searchData.checkIn) || "Add dates"}
                  </div>
                </button>
                {activeField === "checkIn" && (
                  <div className="absolute left-0 top-full mt-2 z-40">
                    <DatePicker
                      inline
                      onChange={(date) => {
                        handleCheckInChange(date);
                        setActiveField("checkOut"); // ✅ Auto-focus to next field
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()} // ✅ No past dates
                      className="w-48 p-2 rounded-lg border border-gray-200 shadow-lg bg-white"
                      calendarClassName="rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className={`w-px h-8 bg-gray-200 transition-colors duration-500 ${
                hoveredField === 'checkIn' || hoveredField === 'checkOut' ? 'opacity-0' : 'opacity-100'
              }`} />

              {/* Check out */}
              <div 
                className={`relative rounded-full transition-colors duration-500 ${getFieldBackground('checkOut')}`}
                onMouseEnter={() => setHoveredField('checkOut')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveField("checkOut");
                    setShowLocationDropdown(false);
                    setShowGuestDropdown(false);
                  }}
                  className={getFieldClasses('checkOut')}
                >
                  <div className="text-xs font-semibold text-gray-700">Check out</div>
                  <div className={`text-base ${
                    searchData.checkOut ? "text-gray-900" : "text-gray-400"
                  }`}>
                    {formatDate(searchData.checkOut) || "Add dates"}
                  </div>
                </button>
                {activeField === "checkOut" && (
                  <div className="absolute left-0 top-full mt-2 z-40">
                    <DatePicker
                      inline
                      onChange={(date) => {
                        handleCheckOutChange(date);
                        setActiveField("guests"); // ✅ Auto-focus next field if needed
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={searchData.checkIn ? new Date(searchData.checkIn).setDate(new Date(searchData.checkIn).getDate() + 1) : null}
                      className="w-48 p-2 rounded-lg border border-gray-200 shadow-lg bg-white"
                      calendarClassName="rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className={`w-px h-8 bg-gray-200 transition-colors duration-500 ${
                hoveredField === 'checkOut' || hoveredField === 'guests' ? 'opacity-0' : 'opacity-100'
              }`} />

              {/* Who and Search Button Container */}
              <div 
                className={`flex-1 gap-5 relative rounded-full transition-colors duration-500 ${getFieldBackground('guests')}`}
                onMouseEnter={() => setHoveredField('guests')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    ref={guestsRef}
                    onClick={() => {
                      setActiveField("guests");
                      setShowLocationDropdown(false);
                      setShowGuestDropdown((prev) => !prev);
                    }}
                    onFocus={() => {
                      setActiveField("guests");
                      setShowLocationDropdown(false);
                      setShowGuestDropdown(true);
                    }}
                    className={`${getFieldClasses('guests')} flex-1 min-w-[120px] pr-24`}
                    aria-haspopup="dialog"
                    aria-expanded={showGuestDropdown}
                  >
                    <div className="text-xs font-semibold text-gray-700">Who</div>
                    <div className={`text-base truncate ${
                      getTotalGuests() > 1 ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {getTotalGuests() > 1
                        ? `${getTotalGuests()} guests`
                        : "Add guests"}
                    </div>
                  </button>
                  <div className="flex-shrink-0 absolute right-2">
                    <button
                      type="submit"
                      className={`bg-[#FF385C] text-white hover:bg-[#E31C5F] transition-all duration-1000 ease-in-out shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-4 focus:ring-red-100 flex items-center justify-center ${
                            isSearchExpanded ? 'rounded-full px-6 py-2 gap-2 w-auto' : 'w-10 h-10 rounded-full'
                          }`}
                      aria-label="Search"
                    >
                      <FaSearch className="w-5 h-5 transition-all duration-1000 ease-in-out" />
                      <span className={`font-semibold whitespace-nowrap transition-all duration-1000 ease-in-out overflow-hidden ${
                        isSearchExpanded ? 'opacity-100 w-auto max-w-[100px]' : 'opacity-0 w-0 max-w-0'
                      }`}>
                        Search
                      </span>
                    </button>
                  </div>
                </div>
                {showGuestDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 z-50 animate-fade-in">
                    <div className="space-y-6 px-6">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Adults</div>
                          <div className="text-sm text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateGuestCount("adults", "decrease")}
                            disabled={searchData.guests.adults <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                            aria-label="Decrease adults"
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchData.guests.adults}</span>
                          <button
                            type="button"
                            onClick={() => updateGuestCount("adults", "increase")}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors bg-white"
                            aria-label="Increase adults"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Children</div>
                          <div className="text-sm text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateGuestCount("children", "decrease")}
                            disabled={searchData.guests.children <= 0}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                            aria-label="Decrease children"
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchData.guests.children}</span>
                          <button
                            type="button"
                            onClick={() => updateGuestCount("children", "increase")}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors bg-white"
                            aria-label="Increase children"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Infants</div>
                          <div className="text-sm text-gray-500">Under 2</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateGuestCount("infants", "decrease")}
                            disabled={searchData.guests.infants <= 0}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                            aria-label="Decrease infants"
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchData.guests.infants}</span>
                          <button
                            type="button"
                            onClick={() => updateGuestCount("infants", "increase")}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors bg-white"
                            aria-label="Increase infants"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </form>

        <div className="flex items-center gap-4 relative">
          {user ? (
            <div ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-3 hover:shadow-md transition-shadow"
              >
                <FaUserCircle className="text-2xl text-gray-500" />
                <span className="font-semibold text-gray-700">{user.username}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/my-bookings');
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/');
                      toast.success('Logged out successfully!', { duration: 1000 });
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-[#FF385C] text-white px-4 py-2 rounded-full font-semibold shadow-md hover:bg-[#e03552] transition duration-300 ease-in-out"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {searchError && (
        <div className="text-red-500 text-sm text-center py-2">
          {searchError}
        </div>
      )}

      {/* Animation styles */}
      <style>
        {`
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px);}
          to { opacity: 1; transform: translateY(0);}
        }
        `}
      </style>
    </div>
  );
};

export default Navbar;
