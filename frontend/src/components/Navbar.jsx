import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token'); 

  const handleLogout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
    alert('You have been logged out.');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold">Image Caption Generator</Link>
        <div className="space-x-6 flex items-center">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hover:underline hover:text-gray-200 transition duration-200"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:underline hover:text-gray-200 transition duration-200">Log In</Link>
              <Link to="/signup" className="hover:underline hover:text-gray-200 transition duration-200">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;