import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
              <span className="text-2xl font-bold text-gray-900">
                ChunabE
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-500 font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-500 font-medium">
              Features
            </a>
            <a href="#services" className="text-gray-700 hover:text-blue-500 font-medium">
              Services
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-500 font-medium">
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="/login"
              className="text-gray-700 hover:text-blue-500 font-medium"
            >
              Login
            </a>
            <a
              href="/Registration_Options"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Register
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white">
          <a href="/" className="block text-gray-700 hover:text-blue-500 font-medium">
            Home
          </a>
          <a href="#features" className="block text-gray-700 hover:text-blue-500 font-medium">
            Features
          </a>
          <a href="#services" className="block text-gray-700 hover:text-blue-500 font-medium">
            Services
          </a>
          <a href="#contact" className="block text-gray-700 hover:text-blue-500 font-medium">
            Contact
          </a>
          <a href="/login" className="block text-gray-700 hover:text-blue-500 font-medium">
            Login
          </a>
          <a
            href="/RegistrationOptions"
            className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center font-medium"
          >
            Register
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;