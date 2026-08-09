import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const NotFound = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div 
      className="relative flex flex-col w-full h-[100vh] overflow-hidden"
      style={{
        backgroundImage: "url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png'), linear-gradient(to top left, var(--bg-page), #F7F7F7)",
        backgroundPosition: "center 40%, 0 0",
        backgroundSize: "var(--spaceship-size, contain), auto",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .not-found-bg { --spaceship-size: 90%; background-position: center 45%, 0 0 !important; }
        }
        @media (max-width: 480px) {
          .not-found-bg { --spaceship-size: 100%; }
        }
      `}</style>
      
      {/* Standard Navbar */}
      <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3 z-50 mt-4 relative">
        {/* Logo Container */}
        <Link
          to="/"
          className="flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform hover:scale-105"
          style={{ backgroundColor: '#EDEDED' }}
        >
          <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
            <path
              fill="rgb(84, 84, 84)"
              d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
            />
          </svg>
        </Link>

        {/* Links Container */}
        <div
          className="flex items-center gap-4 sm:gap-10 rounded-xl px-4 sm:px-8 py-2.5 sm:py-3"
          style={{ backgroundColor: '#EDEDED' }}
        >
          {[
            { name: 'Help', path: '/help' },
            { name: 'Event', path: '/event' },
            { name: 'Team', path: '/team' }
          ].map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-[12px] sm:text-[14px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-[700px] w-full mx-auto px-5 pb-[30px] pt-[250px] text-center z-10">
        
        <div className="relative inline-block mb-[14px]">
          <span className="material-symbols-rounded animate-float-slow absolute top-[-18px] left-[-24px] text-[30px] md:text-[42px]"
                style={{
                  background: 'linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 2px white) drop-shadow(0 0 2px white)'
                }}>
            cloud
          </span>
          
          <h1 className="text-[clamp(26px,5vw,52px)] sm:text-[clamp(34px,5vw,52px)] font-medium tracking-[-1.5px] leading-[1.08] text-[#0f0f0f]">
            404 you lost in tech
          </h1>

          <span className="material-symbols-rounded animate-float-slow-delayed absolute bottom-[-15px] right-[20px] text-[24px] md:text-[32px]"
                style={{
                  background: 'linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 2px white) drop-shadow(0 0 2px white)'
                }}>
            go back
          </span>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
