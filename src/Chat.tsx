import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

interface ChatProps {
  myUserId: string;
  myUserName: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  last_seen?: string | null;
  sap_id?: string | null;
  program?: string | null;
}

interface Message {
  id: number;
  senderId: string;
  text: string;
  timestamp: number;
}

export default function Chat({ myUserId, myUserName }: ChatProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, last_seen, sap_id, program');
          
        if (error) throw error;
        if (data) {
          setUsers(data.filter(u => u.id !== myUserId));
        }
      } catch (e) {
        console.error('Error fetching users for chat:', e);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();

    // Subscribe to the global chat channel for sending messages
    // Listening is handled in Dashboard.tsx which dispatches the 'new_chat_message' event
    const channel = supabase.channel('global_chat');
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myUserId]);

  const loadMessages = (otherUserId: string) => {
    const key = `chat_${myUserId}_${otherUserId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
    } else {
      setMessages([]);
    }
  }, [selectedUser, myUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Listen for custom event triggered by Dashboard when a new message arrives
    const handleNewMessage = (e: any) => {
      const { senderId } = e.detail;
      // If the incoming message is from the currently selected user, reload messages
      if (selectedUser && senderId === selectedUser.id) {
        loadMessages(selectedUser.id);
      }
    };

    window.addEventListener('new_chat_message', handleNewMessage);
    return () => {
      window.removeEventListener('new_chat_message', handleNewMessage);
    };
  }, [selectedUser, myUserId]);

  useEffect(() => {
    const handlePresence = (e: any) => {
      setOnlineUsers(new Set(e.detail));
    };
    window.addEventListener('presence_update', handlePresence);
    return () => window.removeEventListener('presence_update', handlePresence);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !channelRef.current) return;

    const newMsg: Message = {
      id: Date.now(),
      senderId: myUserId,
      text: inputText.trim(),
      timestamp: Date.now()
    };

    // Save locally
    const key = `chat_${myUserId}_${selectedUser.id}`;
    const updatedMessages = [...messages, newMsg];
    localStorage.setItem(key, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setInputText('');

    // Broadcast to the other user
    channelRef.current.send({
      type: 'broadcast',
      event: `message_to_${selectedUser.id}`,
      payload: {
        senderId: myUserId,
        senderName: myUserName,
        text: newMsg.text,
        timestamp: newMsg.timestamp
      }
    });
  };

  const handleDeleteChat = () => {
    if (!selectedUser) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this chat with ${selectedUser.name}? This will only delete it from your device.`);
    if (confirmDelete) {
      const key = `chat_${myUserId}_${selectedUser.id}`;
      localStorage.removeItem(key);
      setMessages([]);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Chat</h2>
        <p className="text-gray-500 mt-1">Connect with other club members.</p>
      </div>

      <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm flex overflow-hidden h-[calc(100vh-200px)]">
        
        {/* Sidebar: Users List */}
        <div className="w-1/3 border-r border-gray-200/60 flex flex-col bg-white/40">
          <div className="p-4 border-b border-gray-200/60 bg-white/50">
            <h3 className="font-semibold text-gray-800">Members</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loadingUsers ? (
              <div className="flex justify-center p-4">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-gray-500 p-4">No other members found.</p>
            ) : (
              users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedUser?.id === user.id ? 'bg-black text-white shadow-md' : 'hover:bg-black/5 text-gray-700'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-black/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    {onlineUsers.has(user.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <p className={`text-sm font-medium truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Member'}</p>
                    {user.program && <p className={`text-[10px] truncate mt-0.5 ${selectedUser?.id === user.id ? 'text-gray-300' : 'text-gray-500'}`}>{user.program}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#f8f8f7]">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200/60 bg-white/60 backdrop-blur-md flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-black/10 flex items-center justify-center">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-500">{selectedUser.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 leading-tight">{selectedUser.name}</h3>
                      {selectedUser.sap_id && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{selectedUser.sap_id}</span>}
                      {selectedUser.program && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{selectedUser.program}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {onlineUsers.has(selectedUser.id) 
                        ? <span className="text-green-600 font-medium">Online</span>
                        : selectedUser.last_seen 
                          ? `Last seen: ${new Date(selectedUser.last_seen).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` 
                          : 'Offline'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleDeleteChat}
                  title="Delete chat from your device"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    No messages yet. Send a message to start chatting! (Chats are only saved locally)
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === myUserId;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-black text-white rounded-tr-sm' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <span className={`text-[10px] block mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200/60 z-10">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all text-sm pr-12"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p>Select a member to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
