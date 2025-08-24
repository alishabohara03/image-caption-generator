import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold">Image Caption Generator</Link>
        <div className="space-x-6 flex items-center">
          <Link to="/login" className="hover:underline hover:text-gray-200 transition duration-200">Log In</Link>
          <Link to="/signup" className="hover:underline hover:text-gray-200 transition duration-200">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;