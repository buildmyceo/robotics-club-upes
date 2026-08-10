import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Event from './Event';
import Team from './Team';
import Help from './Help';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';
import { v4 as uuidv4 } from 'uuid';
import Chat from './Chat';
import Notifications from './Notifications';

type MemberProfile = {
  id: string;
  name: string | null;
  email: string | null;
  program: string | null;
  avatar_url: string | null;
  sap_id: string | null;
  last_seen: string | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [userId, setUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sapId, setSapId] = useState('');
  const [program, setProgram] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Cropper State for Profile Update
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('global_chat');
    
    channel.on('broadcast', { event: `message_to_${userId}` }, (payload) => {
      const { senderId, senderName, text, timestamp } = payload.payload;
      
      // Save to local storage
      const key = `chat_${userId}_${senderId}`;
      const stored = localStorage.getItem(key);
      const messages = stored ? JSON.parse(stored) : [];
      messages.push({
        id: Date.now(),
        senderId,
        text,
        timestamp
      });
      localStorage.setItem(key, JSON.stringify(messages));
      
      // Show Notification Toast
      setMessage({ text: `New message from ${senderName}`, type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      
      // Save Notification to local storage for the Notifications page
      const notifKey = `notifications_${userId}`;
      const notifStored = localStorage.getItem(notifKey);
      const notifications = notifStored ? JSON.parse(notifStored) : [];
      notifications.push({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: 'chat',
        title: `New Message from ${senderName}`,
        message: text,
        timestamp: Date.now()
      });
      localStorage.setItem(notifKey, JSON.stringify(notifications));

      // Dispatch event for Chat component to reload
      window.dispatchEvent(new CustomEvent('new_chat_message', { detail: { senderId } }));
      
      // Dispatch event for Notifications component to reload
      window.dispatchEvent(new CustomEvent('new_notification'));
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Online/Offline Presence & Last Seen
  useEffect(() => {
    if (!userId) return;

    // Function to update last_seen in the database
    const updateLastSeen = async () => {
      try {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId);
      } catch (e) {
        console.error('Error updating last seen', e);
      }
    };
    
    // Update immediately and then every minute
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000);

    // Join Presence Channel
    const presenceChannel = supabase.channel('online_users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // Collect all online user IDs
        const onlineIds = Object.keys(state).map(key => (state[key][0] as any)?.user_id).filter(Boolean);
        window.dispatchEvent(new CustomEvent('presence_update', { detail: onlineIds }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: userId });
        }
      });

    const handleUnload = () => {
      updateLastSeen();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      supabase.removeChannel(presenceChannel);
    };
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate('/login');
        return;
      }
      
      setUserId(user.id);
      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setName(data.name || '');
        setPhone(data.phone || '');
        setSapId(data.sap_id || '');
        setProgram(data.program || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- Avatar Upload Handlers ---
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

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels && userId) {
        setSaving(true);
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        if (!croppedImageBlob) throw new Error('Failed to crop image');

        const fileExt = 'jpeg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, croppedImageBlob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const newAvatarUrl = publicUrlData.publicUrl;

        // Update profile in DB
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', userId);

        if (updateError) throw updateError;
        
        setAvatarUrl(newAvatarUrl);
        setShowCropper(false);
        setMessage({ text: 'Profile picture updated!', type: 'success' });
      }
    } catch (e: any) {
      console.error(e);
      setMessage({ text: e.message || 'Failed to update avatar.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, email, name, phone, sap_id: sapId, program }, { onConflict: 'id' });

      if (error) throw error;
      setMessage({ text: 'Profile saved successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to save profile.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    navigator.clipboard.writeText(link);
    setMessage({ text: 'Invite link copied to clipboard!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleRefreshApp = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } catch (e) {
        console.error('SW unregister error', e);
      }
    }
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch (e) {
      console.error('Cache delete error', e);
    }
    window.location.reload();
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0ee]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0ee] flex flex-col md:flex-row relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Top Bar */}
      <div className="md:hidden w-full bg-white/60 backdrop-blur-xl border-b border-white/40 p-4 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-lg">
             <svg width="16" height="16" viewBox="0 0 256 256" fill="none">
               <path fill="#fff" d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"/>
             </svg>
          </div>
          <h1 className="font-bold text-lg text-gray-900 tracking-tight">Dashboard</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/50 hover:bg-gray-50"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 md:w-64 bg-white/95 md:bg-white/40 backdrop-blur-xl border-r border-white/40 p-6 flex flex-col h-full shadow-2xl md:shadow-none`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
             <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
               <path fill="#fff" d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"/>
             </svg>
            </div>
            <h1 className="font-bold text-lg text-gray-900 tracking-tight">Dashboard</h1>
          </div>
          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {[
            { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'members', label: 'Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'team', label: 'Team Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
            { id: 'invite', label: 'Invite Friends', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
            { id: 'help', label: 'Help & FAQs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false); // Close sidebar on mobile when tab clicked
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === tab.id 
                  ? 'bg-white shadow-sm text-black border border-white/50' 
                  : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-2">
          <button 
            onClick={handleRefreshApp}
            title="Click this if you don't see new updates"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh App
          </button>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 h-[calc(100vh-68px)] md:h-screen overflow-y-auto custom-scrollbar">
        
        {/* Floating Message Alert */}
        {message.text && (
          <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
            <div className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border ${
              message.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-red-50/90 border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Tab Contents */}
        <div className="h-full w-full">
          
          {/* My Profile */}
          {activeTab === 'profile' && (
            <div className="p-6 md:p-12 max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-500 mt-1">Manage your personal information and club settings.</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm">
                
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-200/60">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl text-gray-400 font-bold">{name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                      <span className="text-xs font-medium">Edit</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{name || 'Member'}</h3>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">UPES Email (Read-only)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100/50 border border-transparent text-gray-500 text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">Your verified university email cannot be changed.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/30 transition-all text-gray-900 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SAP ID</label>
                      <input
                        type="text"
                        value={sapId}
                        onChange={(e) => setSapId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/30 transition-all text-gray-900 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/30 transition-all text-gray-900 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Program / Major</label>
                      <input
                        type="text"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/30 transition-all text-gray-900 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-black text-white font-medium text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all shadow-sm"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* Invite a Friend */}
          {activeTab === 'invite' && (
            <div className="p-6 md:p-12 max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Invite Friends</h2>
                <p className="text-gray-500 mt-1">Grow the club! Share this link with your batchmates.</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-inner">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Share the passion for Robotics</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">When your friends sign up using your link, they'll get instant access to our upcoming workshops, hackathons, and team projects.</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto">
                  <div className="flex-1 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 truncate shadow-inner">
                    {window.location.origin}{import.meta.env.BASE_URL}login
                  </div>
                  <button 
                    onClick={handleCopyInvite}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black text-white font-medium text-sm hover:bg-gray-800 transition-all shadow-sm shrink-0 whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200/60 flex items-center justify-center gap-4">
                  <a 
                    href={`https://wa.me/?text=Hey! Join the UPES Robotics Club using this link: ${window.location.origin}${import.meta.env.BASE_URL}login`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366]/10 text-[#25D366] font-medium text-sm hover:bg-[#25D366]/20 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                  <a 
                    href={`mailto:?subject=Join me at UPES Robotics Club&body=Hey! Join the UPES Robotics Club using this link: ${window.location.origin}${import.meta.env.BASE_URL}login`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 font-medium text-sm hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && <MembersTab currentUserId={userId} onChatWith={(id, memberName) => { setActiveTab('chat'); }} />}

          {/* Embedded Layouts (Events, Team, Help, Chat) */}
          <div className={`${['events', 'team', 'help', 'chat', 'notifications'].includes(activeTab) ? 'block' : 'hidden'} h-full w-full overflow-y-auto`}>
            {activeTab === 'events' && <Event isDashboard={true} />}
            {activeTab === 'team' && <Team isDashboard={true} />}
            {activeTab === 'help' && <Help isDashboard={true} />}
            {activeTab === 'chat' && userId && <Chat myUserId={userId} myUserName={name} />}
            {activeTab === 'notifications' && userId && <Notifications myUserId={userId} />}
          </div>

        </div>
      </main>

      {/* Cropper Modal (Reused from Login) */}
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
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-black" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Rotation</label>
                <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-black" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCropper(false)} className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleCropSave} disabled={saving} className="flex-1 py-2.5 rounded-xl font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Profile Pic'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Members Tab Component ────────────────────────────────────────────────────

function MembersTab({
  currentUserId,
  onChatWith,
}: {
  currentUserId: string | null;
  onChatWith: (id: string, name: string) => void;
}) {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineIds, setOnlineIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, program, avatar_url, sap_id, last_seen')
        .order('name', { ascending: true });
      if (!error && data) setMembers(data as MemberProfile[]);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  // Listen for presence updates from Dashboard parent
  useEffect(() => {
    const handler = (e: Event) => {
      setOnlineIds((e as CustomEvent<string[]>).detail || []);
    };
    window.addEventListener('presence_update', handler as EventListener);
    return () => window.removeEventListener('presence_update', handler as EventListener);
  }, []);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.program || '').toLowerCase().includes(q)
    );
  });

  const isOnline = (id: string) => onlineIds.includes(id);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 mt-1">All registered Robotics Club members</p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
          <span>{members.length} total members</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
          <span>{onlineIds.length} online now</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-lg font-medium">No members found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(member => {
            const online = isOnline(member.id);
            const isMe = member.id === currentUserId;
            const initials = (member.name || member.email || '?').charAt(0).toUpperCase();

            return (
              <div
                key={member.id}
                className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200/80 transition-all duration-200 flex flex-col gap-4"
              >
                {/* Avatar + online dot */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name || 'Member'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-lg font-bold">{initials}</span>
                      )}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Online" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {member.name || 'Unnamed Member'}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-indigo-500">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{member.email || '—'}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 text-xs text-gray-500 flex-1">
                  {member.program && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span className="truncate">{member.program}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${online ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!isMe && (
                  <button
                    onClick={() => onChatWith(member.id, member.name || 'Member')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
