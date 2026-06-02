import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Users, Copy, Globe, Search, Mail, Github, Check } from 'lucide-react';

export default function App() {
  // Option A State: Quick Play Matchmaking
  const [isSearching, setIsSearching] = useState(false);
  
  // Option B State: Toggle between "join" and "create"
  const [roomMode, setRoomMode] = useState('join'); // 'join' or 'create'
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('WB-882X');
  const [copied, setCopied] = useState(false);

  // Generate random room code
  const generateRoomCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = 'WB-';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setGeneratedCode(code);
  };

  useEffect(() => {
    if (roomMode === 'create') {
      generateRoomCode();
    }
  }, [roomMode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Matchmaking simulation
  useEffect(() => {
    let timeout;
    if (isSearching) {
      timeout = setTimeout(() => {
        setIsSearching(false);
        alert('Match Found! Entering Arena...');
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isSearching]);

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col justify-between selection:bg-white selection:text-black">
      {/* 1. Global Setup & Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" type="video/mp4" />
      </video>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-radial-gradient z-0 pointer-events-none" />

      {/* Embedded CSS for Liquid Glass and Radial Gradient */}
      <style>{`
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.6) 80%);
        }
        
        /* 4. Liquid Glass Component CSS */
        .liquid-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .liquid-glass-strong {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        /* Micro-animations and pulse loader */
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .pulse-effect {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          width: 140px;
          height: 140px;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
      `}</style>

      {/* 2. Header Navigation */}
      <header className="w-full px-6 lg:px-12 py-8 flex justify-between items-center relative z-10">
        {/* Left Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = 'menu.html'}
          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors hover:bg-white/5"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium tracking-tight">Back</span>
        </motion.button>

        {/* Center Title */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter uppercase">
            Multiplayer <em className="font-serif italic font-normal text-white/80 lowercase">Arena</em>
          </h1>
        </div>

        {/* Right Profile Pill */}
        <div className="liquid-glass-strong rounded-full px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold tracking-tight">NoxShenk</span>
          <span className="text-[10px] tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-md font-mono">LVL 42</span>
        </div>
      </header>

      {/* 3. Multiplayer Mode Selection (Two-Panel Layout) */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6 relative z-10 mt-6 mb-12 items-center">
        
        {/* Option A: Quick Play (Matchmaking) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="liquid-glass rounded-[2.5rem] p-8 flex flex-col items-center justify-between text-center group hover:bg-white/5 transition-colors h-[480px]"
        >
          <div className="w-full flex flex-col items-center">
            {/* Pulsing Icon or Pulse Loader based on isSearching state */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <AnimatePresence mode="wait">
                {!isSearching ? (
                  <motion.div
                    key="zap-icon"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors"
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search-loader"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="pulse-effect" style={{ animationDelay: '0s' }} />
                    <div className="pulse-effect" style={{ animationDelay: '0.6s' }} />
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center z-10">
                      <Globe className="w-10 h-10 text-white animate-spin-slow" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <h2 className="text-2xl font-semibold mb-2 tracking-tight">Quick Play</h2>
            <p className="text-white/50 text-sm max-w-[280px]">
              Instantly match with word blasters across the globe.
            </p>
          </div>

          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {!isSearching ? (
                <motion.button
                  key="find-match-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsSearching(true)}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shadow-lg hover:shadow-white/10"
                >
                  Find Match
                </motion.button>
              ) : (
                <motion.button
                  key="searching-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsSearching(false)}
                  className="w-full py-4 rounded-2xl liquid-glass-strong text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                >
                  Finding Opponent...
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Option B: Private Rooms (Create/Join) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="liquid-glass-strong rounded-[2.5rem] p-8 flex flex-col items-center justify-between h-[480px]"
        >
          <div className="w-full flex flex-col items-center">
            {/* Header Icon */}
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>

            {/* Top Toggle Switch */}
            <div className="liquid-glass p-1 rounded-full flex gap-1 mb-8 w-64 justify-between">
              <button
                onClick={() => setRoomMode('join')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  roomMode === 'join' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Join Room
              </button>
              <button
                onClick={() => setRoomMode('create')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  roomMode === 'create' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Create Room
              </button>
            </div>

            {/* Dynamic Views: Join or Create */}
            <div className="w-full h-32 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {roomMode === 'join' ? (
                  <motion.div
                    key="join-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex flex-col items-center"
                  >
                    <input
                      type="text"
                      maxLength={6}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="w-full max-w-[280px] liquid-glass text-center text-xl tracking-[0.4em] uppercase font-bold py-3.5 rounded-xl placeholder:text-white/10 outline-none focus:border-white/30 focus:bg-white/5 transition-all"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="create-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                      <span className="text-3xl font-serif tracking-widest font-bold text-white select-all">
                        {generatedCode}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyCode}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center"
                        title="Copy Code"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </motion.button>
                    </div>
                    <span className="text-[10px] tracking-widest uppercase text-white/40 mt-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
                      Waiting for Players
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Button: Execute */}
          <div className="w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (roomMode === 'join') {
                  if (roomCodeInput.trim().length === 0) {
                    alert('Please enter a room code.');
                  } else {
                    alert(`Joining Private Room: ${roomCodeInput}`);
                  }
                } else {
                  alert(`Starting Private Game in Room: ${generatedCode}`);
                }
              }}
              className="w-full py-4 rounded-2xl liquid-glass border border-white/15 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer shadow-lg"
            >
              Execute
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* 6. Dev Info Footer */}
      <footer className="w-full px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60 text-[10px] tracking-widest uppercase relative z-10 text-center md:text-left">
        <div>Word Blaster Online Mode</div>
        <div className="font-serif italic font-normal normal-case text-xs tracking-normal">
          "Moto Mission: Master the Language"
        </div>
        <div className="flex items-center gap-2">
          <span>Nox Shenk Creation • noxshenk@gmail.com</span>
          <a
            href="https://github.com/noxshenk"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github size={12} className="inline-block align-middle" />
          </a>
        </div>
      </footer>
    </div>
  );
}
