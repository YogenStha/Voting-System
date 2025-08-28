import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
            <span className="text-2xl font-bold text-indigo-500">
              ChunabE
            </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-indigo-400 font-bold">
              Home
            </a>
            <a href="#features" className="text-gray-300 hover:text-indigo-400 font-bold">
              Features
            </a>
            <a href="#services" className="text-gray-300 hover:text-indigo-400 font-bold">
              Services
            </a>
            <a href="#contact" className="text-gray-300 hover:text-indigo-400 font-bold">
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="/login"
              className="text-gray-300 hover:text-indigo-400 font-bold"
            >
              Login
            </a>
            <a
              href="/Registration_Options"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-bold"
            >
              Register
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
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
        <div className="md:hidden px-4 pb-4 space-y-2 bg-black">
          <a href="/" className="block text-gray-300 hover:text-indigo-400 font-bold">
            Home
          </a>
          <a href="#features"  className="block text-gray-300 hover:text-indigo-400 font-bold">
            Features
          </a>
          <a href="#services" className="block text-gray-300 hover:text-indigo-400 font-bold">
            Services
          </a>
          <a href="#contact" className="block text-gray-300 hover:text-indigo-400 font-bold">
            Contact
          </a>
          <a href="/login" className="block text-gray-300 hover:text-indigo-400 font-bold">
            Login
          </a>
          <a
            href="/RegistrationOptions"
            className="block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center font-bold"
          >
            Register
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;