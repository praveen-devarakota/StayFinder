import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext'; // ✅ Correct admin auth context

function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, user } = useAdminAuth(); // ✅ Use the correct hook
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  
  console.log("Login attempt with:", email, password);

  try {
    const success = await login({ email, password });
    console.log("Login success:", success);

    if (success) {
      navigate('/admin-dashboard'); // Redirect to admin dashboard
    }
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    alert(message);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-600 drop-shadow-md">Admin Login</h1>

      <form onSubmit={handleLogin} className="bg-white shadow-lg rounded-lg px-10 pt-8 pb-10 w-full max-w-md">
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-800 text-lg font-semibold mb-2">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            required
          />
        </div>

        <div className="mb-8 relative">
          <label htmlFor="password" className="block text-gray-800 text-lg font-semibold mb-2">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Enter your password"
            className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 bottom-1.5 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </span>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLoginPage;
