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

function Help() {
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
          <div className="inline-block bg-white/50 backdrop-blur-md px-10 py-3 rounded-[2rem] border border-white/40 shadow-sm mb-12">
            <h1 className="text-[2.5rem] sm:text-[3.5rem] leading-[1.15] font-bold text-gray-900 tracking-tight text-center">
              Help & Contact
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Card 1 */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 shadow-sm flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
              <div className="w-16 h-16 bg-[#EDEDED] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Media & Marketing</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Shreyansh Nayak</h3>
              
              <div className="flex flex-col gap-3 items-center">
                <a href="tel:7898387725" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors w-full justify-center font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  7898387725
                </a>
                <span className="text-gray-500 text-sm mt-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Outlook mail not available
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 shadow-sm flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
              <div className="w-16 h-16 bg-[#EDEDED] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              </div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Technical Head</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Harshit Kumar</h3>
              
              <div className="flex flex-col gap-3 items-center w-full">
                <a href="tel:9229950815" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors w-full justify-center font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  9229950815
                </a>
                <a href="mailto:Harshit.36213@stu.upes.ac.in" className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full justify-center font-medium shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Harshit.36213@stu.upes.ac.in
                </a>
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

export default Help;
