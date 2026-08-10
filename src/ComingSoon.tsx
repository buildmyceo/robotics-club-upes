
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
    <path
      fill="rgb(84, 84, 84)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

function ComingSoon() {
  const location = useLocation();
  const rawPath = location.pathname.replace(/^\/+/, '');
  const pageName = rawPath ? rawPath.charAt(0).toUpperCase() + rawPath.slice(1) : '';

  const navLinks = [
    { name: 'Event', path: '/event' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full animate-[floatSlow_5s_ease-in-out_infinite]"
        style={{
          backgroundImage: "url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3">
          {/* Logo Container */}
          <Link
            to="/"
            className="flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: '#EDEDED' }}
          >
            <Logo />
          </Link>

          {/* Links Container */}
          <div
            className="flex items-center gap-4 sm:gap-10 rounded-xl px-4 sm:px-8 py-2.5 sm:py-3"
            style={{ backgroundColor: '#EDEDED' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[12px] sm:text-[14px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        
          {/* Login Button */}
          <Link
            to="/login"
            className="flex items-center justify-center rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-[14px] font-medium text-gray-800 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white/60 hover:shadow-md transition-all duration-300 shadow-sm ml-2"
          >
            Login
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-end pb-10 sm:pb-16 lg:pb-20 px-6 sm:px-12 md:px-20 lg:px-28">
          <div className="max-w-xs">

            {/* Headline */}
            <h1 className="text-[3rem] sm:text-[4rem] leading-[1.15] font-bold text-gray-900 tracking-tight mb-3">
              Coming Soon {pageName}
            </h1>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default ComingSoon;
