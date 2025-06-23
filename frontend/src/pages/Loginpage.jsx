import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineMail, HiEye, HiEyeOff } from 'react-icons/hi';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import toast from 'react-hot-toast';

function Loginpage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (formData) => {
    const newErrors = {};
    
    if (showCreate) {
      // Signup validation
      if (!formData.username?.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.email.value.trim(),
      password: e.target.password.value.trim()
    };

    if (!validateForm(formData)) return;

    setIsLoading(true);
    try {
      const success = await login(formData);
      if (success) {
        toast.success('Logged in successfully!', { duration: 1000 });
        navigate('/');
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const formData = {
      username: e.target.newUsername.value.trim(),
      email: e.target.email.value.trim(),
      password: e.target.newPassword.value.trim()
    };

    if (!validateForm(formData)) return;

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/signup', formData);
      if (res.data.success) {
        toast.success('Account created successfully!', { duration: 1000 });
        // Auto login after successful signup
        await login({ email: formData.email, password: formData.password });
        navigate('/');
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {showCreate ? 'Create Account' : 'Login'}
            </h1>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {!showCreate ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-gray-600 font-medium mb-2" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      className={`w-full p-3 pr-12 text-sm bg-white/80 rounded-xl focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C] transition duration-300`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#FFF8F2] p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#FF385C]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.591 7.591a2.25 2.25 0 01-3.182 0L3.409 8.584A2.25 2.25 0 012.75 6.993V6.75" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Enter your password"
                      className={`w-full p-3 pr-12 text-sm bg-white/80  rounded-xl focus:border-[#FF385C] focus:outline-none focus:ring-2 focus:ring-[#FF385C] transition duration-300`}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 bg-[#FFF8F2] p-1 rounded-full transition-colors duration-200 ease-in-out `}
                    >
                      {showPassword
                        ? <FiEyeOff className="w-5 h-5 text-[#FF385C]" />
                        : <FiEye className="w-5 h-5 text-[#FF385C]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 rounded-xl font-semibold text-white shadow-md transition duration-300 ease-in-out ${
                      isLoading
                        ? 'bg-[#FF385C] opacity-70 cursor-not-allowed'
                        : 'bg-[#FF385C] hover:bg-[#e03552]'
                    }`}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-6">
                <div>
                  <label className="block text-gray-600 font-medium mb-2" htmlFor="newUsername">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="newUsername"
                      placeholder="Choose a username"
                      className={`w-full p-3 pr-12 text-sm bg-white/80  rounded-xl focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C] transition duration-300`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#FFF8F2] p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#FF385C]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
                      </svg>
                    </div>
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      className={`w-full p-3 pr-12 text-sm bg-white/80  rounded-xl focus:border-[#FF385C] focus:outline-none focus:ring-2 focus:ring-[#FF385C] transition duration-300`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#FFF8F2] p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#FF385C]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.591 7.591a2.25 2.25 0 01-3.182 0L3.409 8.584A2.25 2.25 0 012.75 6.993V6.75" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2" htmlFor="newPassword">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      id="newPassword"
                      placeholder="Create a password"
                      className={`w-full p-3 pr-12 text-sm bg-white/80  rounded-xl focus:border-[#FF385C] focus:outline-none 
                        focus:ring-2 focus:ring-[#FF385C] transition duration-300`}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 bg-[#FFF8F2] p-1 rounded-full transition-colors duration-200 ease-in-out`}
                    >
                      {showSignupPassword
                        ? <FiEyeOff className="w-5 h-5 text-[#FF385C]" />
                        : <FiEye className="w-5 h-5 text-[#FF385C]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 rounded-xl font-semibold text-white shadow-md transition duration-300 ease-in-out ${
                      isLoading
                        ? 'bg-[#FF385C] opacity-70 cursor-not-allowed'
                        : 'bg-[#FF385C] hover:bg-[#e03552]'
                    }`}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-gray-600">
              {showCreate ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                className="font-semibold text-[#FF385C] hover:text-[#e03552] hover:underline transition-colors duration-200"
                onClick={() => {
                  setShowCreate(!showCreate);
                  setErrors({});
                }}
              >
                {showCreate ? 'Login here' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Loginpage;
