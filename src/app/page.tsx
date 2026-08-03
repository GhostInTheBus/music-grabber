'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, CheckCircle2, AlertCircle, ListMusic } from 'lucide-react';

interface DownloadJob {
  id: string;
  query: string;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
}

const BananaRain = ({ active }: { active: boolean }) => {
  const [bananas, setBananas] = useState<{ id: number; left: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate chaotic bananas
    const newBananas = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2
    }));
    setBananas(newBananas);
  }, []);

  return (
    <div className={`banana-rain-container ${active ? 'active' : ''}`}>
      {bananas.map((b) => (
        <div 
          key={b.id} 
          className="falling-banana" 
          style={{ 
            left: `${b.left}vw`, 
            animationDuration: `${b.duration}s`, 
            animationDelay: `${b.delay}s`,
            animationPlayState: active ? 'running' : 'paused',
            display: active ? 'block' : 'none'
          }}
        >
          🍌
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('single');
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newJob: DownloadJob = {
      id: Date.now().toString(),
      query: query.trim(),
      status: 'queued',
      progress: 0,
      message: 'PRIMATES DEPLOYED! 🦍🚀',
    };

    setJobs((prev) => [newJob, ...prev]);
    setQuery('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newJob.query, id: newJob.id, mode }),
      });

      if (!response.ok) {
        throw new Error('Failed to start download');
      }
      
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setJobs((prev) => 
                prev.map((job) => 
                  job.id === newJob.id ? { ...job, ...data } : job
                )
              );
            } catch (err) {
              console.error('Error parsing SSE data', err);
            }
          }
        }
      }
    } catch (err) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? { ...job, status: 'error', message: 'THE MONKEYS CRASHED THE CAR! 💥' }
            : job
        )
      );
    }
  };

  if (!isClient) return null;

  const isDownloading = jobs.some(job => job.status === 'downloading' || job.status === 'queued');

  return (
    <>
      <BananaRain active={isDownloading} />
      
      {/* THE MONKEY CAR */}
      <div className={`monkey-car ${isDownloading ? 'driving' : ''}`}>
        🚗🦍💨
      </div>
      
      <main className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '1.5rem', position: 'relative' }}>
          
          <motion.div
            style={{ display: 'inline-block', fontSize: '6rem', marginBottom: '-20px', position: 'relative', zIndex: 5, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.8))' }}
          >
            🦍
          </motion.div>
          
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ 
              fontSize: '5.5rem', 
              marginBottom: '1rem', 
              color: 'var(--primary-color)',
              position: 'relative',
              zIndex: 10
            }}
          >
            MONKEY GRABBER 🍌
          </motion.h1>
          
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ 
              color: '#ffe600', 
              fontSize: '1.4rem', 
              maxWidth: '700px', 
              margin: '0 auto', 
              fontWeight: 800,
              background: 'rgba(0,0,0,0.7)',
              padding: '16px 30px',
              borderRadius: '20px',
              border: '3px dashed var(--primary-color)',
              boxShadow: '4px 4px 0 var(--wood-dark)'
            }}
          >
            FEED THE PRIMATES A YOUTUBE URL. THEY WILL BRING YOU THE LOOT! 🌴
          </motion.p>
        </div>

        <div className="grid-2">
          <motion.div
            initial={{ x: -100, opacity: 0, rotate: -5 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
          >
            <div className="glass-panel" style={{ padding: '3.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem', fontSize: '2.8rem', color: 'var(--primary-color)', textShadow: '3px 3px 0px var(--wood-dark)' }}>
                <span style={{ display: 'inline-block', fontSize: '3rem' }}>🦧</span>
                TARGET
              </h2>
              <form onSubmit={handleDownload} className="flex-col" style={{ gap: '2.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase' }}>
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-field"
                    placeholder="e.g. https://youtube.com/..."
                  />
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase' }}>
                    <ListMusic size={26} color="#ffe600" />
                    BUNCH SIZE
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="input-field"
                  >
                    <option value="single">ONE BANANA 🍌 (1 Track)</option>
                    <option value="top10">HANDFUL 🍌🍌 (Top 10)</option>
                    <option value="top50">BIG BUNCH 🍌🍌🍌 (Top 50)</option>
                    <option value="playlist">WHOLE JUNGLE 🌴 (Playlist URL)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="button-primary crazy-pulse" 
                  disabled={!query.trim()} 
                  style={{ width: '100%', marginTop: '1.5rem', padding: '24px' }}
                >
                  <span style={{ display: 'inline-block', fontSize: '2.2rem' }}>🦍</span>
                  DEPLOY THE PRIMATES!
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0, rotate: 5 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
          >
            <div className="glass-panel" style={{ padding: '3.5rem', minHeight: '100%' }}>
              <h2 style={{ marginBottom: '2.5rem', fontSize: '2.8rem', color: 'var(--primary-color)', textShadow: '3px 3px 0px var(--wood-dark)' }}>
                THE LOOT 🍌
              </h2>
              
              <div className="flex-col" style={{ gap: '2rem' }}>
                <AnimatePresence>
                  {jobs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ textAlign: 'center', color: '#fff', padding: '5rem 2rem', fontWeight: 700, fontSize: '1.4rem', background: 'rgba(0,0,0,0.6)', borderRadius: '20px', border: '3px dashed var(--wood-light)' }}
                    >
                      <div style={{ fontSize: '6rem', marginBottom: '1.5rem', display: 'inline-block' }}>💤🦧</div>
                      <br/>
                      AWAITING ORDERS...
                    </motion.div>
                  ) : (
                    jobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                          background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(110, 64, 27, 0.7))',
                          border: '4px solid var(--wood-light)',
                          borderRadius: '20px',
                          padding: '1.8rem',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
                        }}
                      >
                        <div className="flex-between" style={{ marginBottom: '1.2rem' }}>
                          <span style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%', fontSize: '1.4rem', color: 'var(--primary-color)', textShadow: '2px 2px 0px rgba(0,0,0,0.9)' }}>
                            {job.query}
                          </span>
                          <span style={{ fontSize: '2rem' }}>
                            {job.status === 'downloading' && <span style={{ display: 'inline-block' }}>🦍</span>}
                            {job.status === 'completed' && <span>🦍✅</span>}
                            {job.status === 'error' && <span>🙊❌</span>}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.2rem', fontWeight: 700 }}>
                          {job.status === 'downloading' ? '🍌 PEELING AUDIO...' : job.message}
                        </div>

                        {job.status === 'downloading' && (
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${job.progress}%` }}></div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
