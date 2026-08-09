import { Link } from 'react-router-dom';
import Footer from './Footer';

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
    <path
      fill="rgb(84, 84, 84)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

function Workshop() {
  const navLinks = [
    { name: 'Event', path: '/event' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: '#EDEDED' }}
          >
            <Logo />
          </Link>

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
        </nav>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center pt-10 sm:pt-16 pb-10 px-6">
          <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-sm p-8 sm:p-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold tracking-wider uppercase mb-6">
              Coming Soon
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Workshop for 2 Weeks
            </h1>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Join our intensive 2-week robotics workshop designed to take you from basics to advanced building. This immersive experience will cover everything from foundational electronics to advanced programming and automation.
            </p>
            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What you will learn:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Basic Electronics and Circuit Design</li>
                <li>Microcontroller Programming (Arduino/Raspberry Pi)</li>
                <li>Sensor Integration and Actuators</li>
                <li>Autonomous Navigation Basics</li>
                <li>Project Building & Troubleshooting</li>
              </ul>
            </div>
            
            <Link 
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-md"
            >
              Register for Workshop
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
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

export default Workshop;
