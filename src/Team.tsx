import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

// Use local videos for offline support
const CARD_VIDEOS = [
  'videos/vid1.mp4',
  'videos/vid6.mp4',
  'videos/vid33.mp4',
  'videos/vid6.mp4',
  'videos/vid5.mp4',
  'videos/vid3.mp4',
  'videos/vid4.mp4'
].map(path => import.meta.env.BASE_URL + path);

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
    <path
      fill="rgb(84, 84, 84)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

function Team({ isDashboard = false }: { isDashboard?: boolean }) {
  const teamMembers = [
    { role: 'President', name: 'Rudrakshi' },
    { role: 'Vice President', name: 'Smaksh' },
    { role: 'Technical Head', name: 'Harshit & Yash' },
    { role: 'Media & Branding', name: 'Shreyansh & Harsh' },
    { role: 'Design Head', name: 'Pragya' },
    { role: 'Operation Head', name: 'Soubhik Roy' },
    { role: 'Treasurer Head', name: 'Nitya' }
  ];

  const navLinks = [
    { name: 'Event', path: '/event' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' }
  ];

  const cardCount = teamMembers.length;
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameId = useRef<number>(0);
  
  // Continuous scroll progress
  const progress = useRef<number>(0);

  // Track mouse coordinates for interactive 3D parallax tilt with inertia damping
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Responsive state containing card dimensions
  const [metrics, setMetrics] = useState({
    cardW: 336,
    cardH: 211, // 1.59 standard credit card ratio
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };

    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

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

    // Try to play immediately
    // Use a small timeout to ensure DOM is fully ready
    setTimeout(playVideos, 100);

    // Also attempt to play on user interaction to handle strict autoplay policies (like Safari low power mode)
    document.addEventListener('click', playVideos, { once: true });
    document.addEventListener('touchstart', playVideos, { once: true, passive: true });
    document.addEventListener('scroll', playVideos, { once: true, passive: true });

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', playVideos);
      document.removeEventListener('touchstart', playVideos);
      document.removeEventListener('scroll', playVideos);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let cardW;
      if (w < 640) {
        // Mobile: Make the card take up 65% of the screen width, up to 280px
        cardW = Math.min(280, Math.round(w * 0.65));
      } else {
        // Desktop/Tablet
        cardW = Math.round(w * 0.16 + 130);
        const heightFactor = Math.min(1.0, Math.max(0.65, h / 850));
        cardW = Math.round(cardW * heightFactor);
        cardW = Math.min(336, Math.max(150, cardW));
      }
      
      const cardH = Math.round(cardW / 1.5925); 

      setMetrics({ cardW, cardH });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderLoop = () => {
    progress.current += 0.004; 

    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

    const cards = cardsRefs.current;
    const h = window.innerHeight;
    const { cardH } = metrics;

    const continuousProgress = progress.current;
    const roundedIndex = Math.round(continuousProgress);
    const diffFromRound = continuousProgress - roundedIndex; 
    
    const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
    const virtualActiveIndex = roundedIndex + easedDiff;

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      if (absOffset > 3.0) {
        card.style.visibility = 'hidden';
        continue;
      } else {
        card.style.visibility = 'visible';
      }

      const gap = 36;
      const peekAmount = -55; 
      const D = 1350; 

      let y = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);

        const targetY = cardH + gap;
        y = -sign * (easedT * targetY);

        z = 400 + easedT * (220 - 400);
        rot = easedT * 132;
      } else if (absOffset <= 2) {
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);

        const yStart = cardH + gap;
        const zStart = 220;
        const rotStart = 132;

        const zEnd = -60;
        const rotEnd = 175;

        const sEnd = D / (D - zEnd);
        const yEnd = (h / 2 - peekAmount) / sEnd - (cardH / 2);

        const currentY = yStart + easedT * (yEnd - yStart);
        y = -sign * currentY;

        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);

        const zStart = -60;
        const rotStart = 175;

        const zEnd3 = -250;
        const rotEnd3 = 195;

        const sEnd2 = D / (D - zStart);
        const yEnd2 = (h / 2 - peekAmount) / sEnd2 - (cardH / 2);

        const sEnd3 = D / (D - zEnd3);
        const yEnd3 = (h / 2 + 100) / sEnd3 + (cardH / 2);

        const currentY = yEnd2 + easedT * (yEnd3 - yEnd2);
        y = -sign * currentY;

        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = -sign * rot;
      const centerFactor = Math.max(0, 1 - absOffset);

      const maxTiltY = 15; 
      const maxTiltX = 12; 

      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = localCardRotation + activeTiltX;
      const totalRotY = activeTiltY;

      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = '1';

      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-3deg)`;
    }
  };

  useEffect(() => {
    const tick = () => {
      renderLoop();
      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics, cardCount]);

  const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
      
      {/* 3D Carousel positioned absolutely behind or mixed with content */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none mt-10">
        
        {/* 3D perspective camera space */}
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            perspective: '1350px',
          }}
        >
          {/* Dynamic 3D coordinate viewport */}
          <div
            className="absolute"
            style={{
              width: `${metrics.cardW}px`,
              height: `${metrics.cardH}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {teamMembers.map((member, i) => (
              <div
                key={i}
                ref={(el) => { cardsRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{
                  width: `${metrics.cardW}px`,
                  height: `${metrics.cardH}px`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                }}
              >
                {/* Build physical 3D volumetric thickness by dense parallel layering */}
                {thicknessLayers.map((zOffset, layerIdx) => {
                  const isFrontFace = layerIdx === thicknessLayers.length - 1;
                  const isBackFace = layerIdx === 0;

                  const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];
                  const baseBgColor = '#0f0f0f';

                  // Middle structural slice
                  if (!isFrontFace && !isBackFace) {
                    return (
                      <div
                        key={layerIdx}
                        className="absolute inset-0 rounded-[16px] border border-[#808080] pointer-events-none overflow-hidden"
                        style={{
                          backgroundColor: '#808080',
                          transform: `translateZ(${zOffset}px)`,
                        }}
                      />
                    );
                  }

                  // Front face slice
                  if (isFrontFace) {
                    const frontBorderStyle = "border border-white/15";
                    return (
                      <div
                        key={layerIdx}
                        className={`absolute inset-0 rounded-[16px] ${frontBorderStyle} pointer-events-none overflow-hidden`}
                        style={{
                          backgroundColor: baseBgColor,
                          transform: `translateZ(${zOffset}px)`,
                          backfaceVisibility: 'hidden',
                          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                        }}
                      >
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={videoSrc.replace('.mp4', '-poster.jpg')}
                          className="absolute inset-0 w-full h-full object-cover rounded-[16px]"
                        >
                          <source src={videoSrc} type="video/mp4" />
                        </video>

                        <div className="absolute inset-0 p-5 sm:p-6 text-white h-full w-full font-sans z-10 bg-black/15">

                          {/* Robotics Club - positioned at top-right */}
                          <div className="absolute right-5 sm:right-6 top-5 sm:top-6 opacity-95 flex items-center justify-center">
                            <span 
                              className="text-white text-[12px] sm:text-[14px] font-bold tracking-wider uppercase drop-shadow-md"
                              style={{ fontFamily: '"JetBrains Mono", monospace' }}
                            >
                              Robotics Club
                            </span>
                          </div>


                          {/* Card holder info and details on the bottom-left */}
                          <div 
                            className="absolute left-4 sm:left-6 bottom-4 sm:bottom-5 z-20 flex flex-col gap-0.5 sm:gap-1 text-left"
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}
                          >
                            {/* Role */}
                            <div className="font-mono text-[10px] sm:text-[12px] font-medium tracking-[0.14em] text-white select-none drop-shadow-md">
                              {member.role.toUpperCase()}
                            </div>
                            {/* Name */}
                            <div className="font-mono text-[12px] sm:text-[14px] font-bold text-white tracking-wide flex items-center gap-2 select-none uppercase mt-1 drop-shadow-md">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Back face slice
                  if (isBackFace) {
                    const backBorderStyle = "border border-white/15";
                    
                    return (
                      <div
                        key={layerIdx}
                        className={`absolute inset-0 rounded-[16px] ${backBorderStyle} pointer-events-none overflow-hidden`}
                        style={{
                          backgroundColor: baseBgColor,
                          transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                          backfaceVisibility: 'hidden',
                          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                        }}
                      >
                        {/* Render Video with premium 16px blur on the back face of the card */}
                        <div className="absolute inset-0 pointer-events-none" style={{ filter: 'blur(16px)', transform: 'scale(1.15)' }}>
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={videoSrc.replace('.mp4', '-poster.jpg')}
                            className="absolute inset-0 w-full h-full object-cover"
                          >
                            <source src={videoSrc} type="video/mp4" />
                          </video>
                        </div>

                        {/* Premium Real Magnetic stripe */}
                        <div className="absolute left-0 right-0 top-4 sm:top-5 h-7 sm:h-9 bg-black/85 backdrop-blur-md z-10" />
                        
                        {/* UPES Text */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 mt-10">
                          <span 
                            className="text-white/90 font-bold tracking-[0.2em] uppercase select-none drop-shadow-lg text-[28px] sm:text-[36px]"
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}
                          >
                            UPES
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        
        {/* Navbar */}
        {!isDashboard && (
        <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3 pointer-events-auto">
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
        
          {/* Login Button */}
          <Link
            to="/login"
            className="flex items-center justify-center rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-[14px] font-medium text-gray-800 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white/60 hover:shadow-md transition-all duration-300 shadow-sm ml-2"
          >
            Login
          </Link>
        </nav>
      )}

        {/* Hero Content */}
        <div className="flex-1 flex flex-col pt-10 px-6 sm:px-12 md:px-20 lg:px-28">
          <div className="w-full max-w-4xl mx-auto">
            {/* Headline */}
            <div className="flex justify-center mb-10">
              <div className="inline-block bg-white/50 backdrop-blur-md px-10 py-2 sm:py-3 rounded-[2rem] border border-white/40 shadow-sm">
                <h1 className="text-[3rem] sm:text-[4rem] leading-[1.15] font-bold text-gray-900 tracking-tight text-center">
                  Our Team
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer (pointer-events-auto so links are clickable) */}
        <div className="pointer-events-auto mt-auto">
          {!isDashboard && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default Team;
