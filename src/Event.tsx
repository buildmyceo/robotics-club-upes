import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
    <path
      fill="rgb(84, 84, 84)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

const slide = {
  title: "Workshop for 2 Weeks",
  subtitle: "Coming Soon",
  description: "Join our intensive 2-week robotics workshop designed to take you from basics to advanced building.",
  image: "https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png", 
};

function Event() {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Event', path: '/event' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
      
      {/* Background with crossfade */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out opacity-100"
        style={{
          backgroundImage: `url('${slide.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.6) blur(4px)',
          transform: 'scale(1.05)'
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform hover:scale-105 shadow-md"
            style={{ backgroundColor: '#EDEDED' }}
          >
            <Logo />
          </Link>

          <div
            className="flex items-center gap-4 sm:gap-10 rounded-xl px-4 sm:px-8 py-2.5 sm:py-3 shadow-md"
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
        </nav>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-12 md:px-20 lg:px-28 py-10">
          
          {/* Card - Clickable */}
          <div 
            onClick={() => navigate('/workshop')}
            className="cursor-pointer group relative w-full max-w-5xl h-[65vh] min-h-[450px] flex items-center bg-black/30 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]"
          >
            <div className="min-w-full w-full h-full flex flex-col justify-end p-8 sm:p-16 relative">
              
              {/* Clean inner image for this slide */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>
              
              <div className="relative z-10 max-w-3xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-sm font-semibold tracking-wider uppercase mb-4 border border-white/20">
                  {slide.subtitle}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-lg leading-tight group-hover:text-blue-100 transition-colors">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/80 font-medium max-w-2xl drop-shadow-md">
                  {slide.description}
                </p>
                <div className="mt-8 flex items-center gap-2 text-white/70 group-hover:text-white transition-colors font-medium">
                  Click for more details
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Event;
