import { useEffect } from 'react';
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

function LandingPage() {
  const navLinks = [
    { name: 'Event', path: '/event' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' }
  ];

  useEffect(() => {
    const playVideos = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.muted = true;
        // Fix for WebKit/Safari bug where video disappears on remount
        if (video.readyState === 0) {
          video.load();
        }
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Video autoplay prevented:", error);
          });
        }
      });
    };

    setTimeout(playVideos, 100);
    document.addEventListener('click', playVideos, { once: true });
    document.addEventListener('touchstart', playVideos, { once: true, passive: true });
    document.addEventListener('scroll', playVideos, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', playVideos);
      document.removeEventListener('touchstart', playVideos);
      document.removeEventListener('scroll', playVideos);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
      {/* Background Video */}
      <video
        key="hero-video"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={`${import.meta.env.BASE_URL}hero-video.mp4`} type="video/mp4" />
      </video>

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
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-end pb-10 sm:pb-16 lg:pb-20 px-6 sm:px-12 md:px-20 lg:px-28">
          <div className="max-w-xs">

            {/* Headline */}
            <h1 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight mb-3">
              Building Intelligent Machines That Shape Tomorrow’s World
            </h1>

            {/* Subtext */}
            <p className="text-[13px] text-gray-400 font-normal mb-3">
              Learn. Build. Innovate. Inspire
            </p>

            {/* CTA */}
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-blue-500 border border-blue-400 rounded-full px-5 py-2.5 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 group"
            >
              Register now
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;
