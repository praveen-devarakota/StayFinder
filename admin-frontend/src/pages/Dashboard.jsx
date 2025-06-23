import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    pricePerNight: '',
    imageUrl: '',
    guests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched users:', res.data);
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.warn('Users API did not return an array');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      }
    };

    fetchUsers();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddAmenity = (e) => {
    e.preventDefault();
    const trimmed = newAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/listings', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('✅ Listing created successfully!');
      setFormData({
        title: '',
        description: '',
        address: '',
        pricePerNight: '',
        imageUrl: '',
        guests: '',
        bedrooms: '',
        bathrooms: '',
        amenities: [],
      });
    } catch (err) {
      console.error('Listing creation failed:', err);
      alert('❌ Failed to create listing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <button onClick={() => setShowForm(false)}>Users</button>
          <button onClick={() => setShowForm(true)}>Create Listing</button>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Users Table */}
        {!showForm && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
            <div className="bg-white shadow-md rounded p-4 overflow-auto">
              {Array.isArray(users) && users.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{user.name}</td>
                        <td className="py-2 px-3">{user.email}</td>
                        <td className="py-2 px-3">{user.role || 'User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          </div>
        )}

        {/* Create Listing Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Create New Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              {[
                'title',
                'description',
                'address',
                'pricePerNight',
                'imageUrl',
                'guests',
                'bedrooms',
                'bathrooms',
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              ))}

              {/* Amenity Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Amenity</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Enter amenity"
                    className="w-full border px-3 py-2 rounded"
                  />
                  <button
                    onClick={handleAddAmenity}
                    className="bg-green-600 text-white px-3 rounded"
                  >
                    Add
                  </button>
                </div>

                {formData.amenities.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {formData.amenities.map((amenity, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{amenity}</span>
                        <button
                          onClick={() => handleRemoveAmenity(index)}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Listing
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
