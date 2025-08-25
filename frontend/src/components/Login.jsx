import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // e.g., 401 Unauthorized
        alert("Login failed. Check your credentials.");
        return;
      }

      const data = await response.json();

      // Save token in localStorage or context
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Welcome ${data.user.name}!`);
      navigate("/"); // Redirect to Home page after login
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg flex flex-col md:flex-row">
        {/* Left Column: Form */}
        <div className="p-6 md:p-8 w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-6 text-black">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-0 pr-3 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-gray-800 hover:underline">Sign up</Link>
          </p>
        </div>
        {/* Right Column: Text */}
        <div className="hidden md:block w-1/2 bg-gray-100 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome!</h2>
          <p className="mb-4 text-gray-600">Log in to start generating captions for your images with our AI-powered tool.</p>
          <p className="text-gray-600">Explore and create today!</p>
        </div>
      </div>
    </div>
  );
};


export default Login;