import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">ChunabE</span>
          </div>

          {/* Menu for large screens */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-indigo-600 font-bold">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 font-bold">
              Features
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600  font-bold">
              Services
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 font-bold">
              Contact
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <a href="/login" className="text-gray-700 hover:text-indigo-600 font-bold">
              Login
            </a>
            <a
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Register
            </a>
          </div>
          {/* Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2">
          <a href="#" className="block text-gray-700 hover:text-indigo-600">
            Home
          </a>
          <a href="#" className="block text-gray-700 hover:text-indigo-600">
            About
          </a>
          <a href="#" className="block text-gray-700 hover:text-indigo-600">
            Services
          </a>
          <a href="#" className="block text-gray-700 hover:text-indigo-600">
            Contact
          </a>
          <a href="#" className="block text-gray-700 hover:text-indigo-600">
            Login
          </a>
          <a
            href="#"
            className="block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center"
          >
            Register
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
