import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Loginpage from './pages/Loginpage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/Profilepage.jsx';
import SingleListing from './pages/SingleListing.jsx';
import MyBookingsWithApi from './pages/MyBookings.jsx';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          top: 120,
          right: 24,
          zIndex: 60,
        }}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#FF385C',
            border: '1px solid #FF385C',
            fontWeight: 'bold',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          },
          iconTheme: {
            primary: '#FF385C',
            secondary: '#fff',
          },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Loginpage/>} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/profile" element={<ProfilePage/>}/>
        <Route path="/listings/:id" element={<SingleListing/>}/>
        <Route path="/my-bookings" element={<MyBookingsWithApi/>}/>
      </Routes>
      <Footer />
    </>
  )
}

export default App
