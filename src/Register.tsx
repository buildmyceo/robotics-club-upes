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

function Register() {
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
        <div className="flex-1 flex flex-col items-center pt-10 sm:pt-16 pb-10 px-4 w-full">
          <div className="inline-block bg-white/50 backdrop-blur-md px-10 py-3 rounded-[2rem] border border-white/40 shadow-sm mb-8">
            <h1 className="text-[2.5rem] sm:text-[3.5rem] leading-[1.15] font-bold text-gray-900 tracking-tight text-center">
              Register Here
            </h1>
          </div>
          
          <div className="w-full max-w-[700px] bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-sm p-4 sm:p-8 flex justify-center overflow-hidden">
            <iframe 
              width="100%" 
              height="800px" 
              src="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=th_MkXUSz0qz6sIT7BYle0BkN5Yqa7BBsHlGaDTi_QhUN0lJNEM0OFdFT040TTE1OTRJT05SSTRNVS4u&embed=true" 
              frameBorder="0" 
              marginWidth={0} 
              marginHeight={0} 
              style={{ border: 'none', maxWidth: '100%', maxHeight: '100vh' }} 
              allowFullScreen 
              title="Registration Form"
            >
              Loading…
            </iframe>
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

export default Register;
