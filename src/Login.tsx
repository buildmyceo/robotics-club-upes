import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Footer from './Footer';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';
import { v4 as uuidv4 } from 'uuid';

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
    <path
      fill="rgb(84, 84, 84)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

const navLinks = [
  { name: 'Event', path: '/event' },
  { name: 'Team', path: '/team' },
  { name: 'Help', path: '/help' }
];

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sapId, setSapId] = useState('');
  const [program, setProgram] = useState('');
  
  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        setCroppedImageBlob(croppedImage);
        setShowCropper(false);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to crop image.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate Email Domain
      if (!email.endsWith('@stu.upes.ac.in')) {
        throw new Error('You must use a valid UPES student email (@stu.upes.ac.in).');
      }

      if (!isLogin) {
        // Validate required fields for signup
        if (!name || !phone || !sapId || !program || !croppedImageBlob) {
          throw new Error('Please fill in all the required fields and upload a profile picture.');
        }

        // Upload Avatar to Supabase Storage
        const fileExt = 'jpeg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, croppedImageBlob, { contentType: 'image/jpeg' });

        if (uploadError) {
          throw new Error('Failed to upload profile picture: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const avatarUrl = publicUrlData.publicUrl;

        // Sign Up User
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name,
              phone,
              sap_id: sapId,
              program,
              avatar_url: avatarUrl
            }
          }
        });
        
        if (error) throw error;
        setSuccess('Account created! Check your UPES email for the confirmation link.');
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard'); // Redirect to dashboard on successful login
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0ee] flex flex-col">
      {/* Background Image / Texture matching app aesthetic */}
      <div
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        style={{
          backgroundImage: "url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(1.2)'
        }}
      />

      {/* Navbar */}
      <nav className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3 relative z-20">
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
        <Link
          to="/login"
          className="flex items-center justify-center rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-[14px] font-medium text-gray-800 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white/60 hover:shadow-md transition-all duration-300 shadow-sm ml-2"
        >
          Login
        </Link>
      </nav>

      {/* Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="w-full max-w-md p-8 bg-white/50 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               {croppedImageBlob && !isLogin ? (
                 <img 
                   src={URL.createObjectURL(croppedImageBlob)} 
                   alt="Profile Preview" 
                   className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                 />
               ) : (
                 <div className="flex items-center justify-center rounded-full w-14 h-14 bg-white/60 border border-white/40 shadow-sm">
                    <Logo />
                 </div>
               )}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Profile'}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin ? 'Sign in to continue to Robotics Club' : 'Join the Robotics Club UPES'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                {/* Profile Picture Upload Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Picture (1:1)</label>
                  <label className="cursor-pointer w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all text-sm font-medium text-gray-700">
                    <span>{croppedImageBlob ? 'Change Picture' : 'Upload Picture'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sapId">SAP ID</label>
                    <input
                      id="sapId"
                      type="text"
                      value={sapId}
                      onChange={(e) => setSapId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                      placeholder="500123456"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                      placeholder="+91 9876543210"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="program">Program</label>
                    <input
                      id="program"
                      type="text"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                      placeholder="B.Tech CSE"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                UPES Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                placeholder="you@stu.upes.ac.in"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-gray-900 text-sm placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-green-50/50 border border-green-100 text-green-600 text-sm">
                {success}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || !email || !password || (!isLogin && (!name || !sapId || !phone || !program || !croppedImageBlob))}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-gray-700 bg-white/40 hover:bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all font-medium text-sm"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="relative w-full h-[300px] sm:h-[400px] bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
              />
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Rotation</label>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCropper(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                >
                  Save Profile Pic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
