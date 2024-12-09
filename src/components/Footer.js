import React from "react";

const Footer = () => {
  return (
    <footer className="bg-transparent text-gray-300 py-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-6">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-white">
              NKTM <span className="font-light">Anime Collection</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#services" className="hover:text-white">
              GitHub
            </a>
            <a href="#portfolio" className="hover:text-white">
              Portfolio
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6">
          {/* Social Media */}
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f text-lg hover:text-white"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter text-lg hover:text-white"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram text-lg hover:text-white"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in text-lg hover:text-white"></i>
            </a>
          </div>

          {/* Copyright */}
          <div className="mt-4 md:mt-0 text-sm">
            © {new Date().getFullYear()} NKTN. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
