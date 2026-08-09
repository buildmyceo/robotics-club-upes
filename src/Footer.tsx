import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-4 px-6 flex items-center justify-center sm:justify-between text-[11px] sm:text-[13px] font-medium text-gray-500 mt-auto border-t border-gray-200/50 bg-white/20 backdrop-blur-md relative z-20">
      <div className="hidden sm:block">
        © {new Date().getFullYear()} Tech Inc. All rights reserved.
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <a href="#" className="hover:text-gray-900 transition-colors duration-200">Twitter</a>
        <a href="#" className="hover:text-gray-900 transition-colors duration-200">LinkedIn</a>
        <a href="#" className="hover:text-gray-900 transition-colors duration-200">Terms</a>
        <a href="#" className="hover:text-gray-900 transition-colors duration-200">Privacy</a>
      </div>
    </footer>
  );
};

export default Footer;
