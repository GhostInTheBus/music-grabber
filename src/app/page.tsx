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
    // Only generate once so they don't re-render randomly
    const newBananas = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3
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
      message: 'Swinging into action... 🐒',
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
            ? { ...job, status: 'error', message: 'The monkeys failed to connect 🙊' }
            : job
        )
      );
    }
  };

  if (!isClient) return null;

  const isDownloading = jobs.some(job => job.status === 'downloading' || job.status === 'queued');

  return (
    <>
      <div className="vine-overlay"></div>
      <BananaRain active={isDownloading} />
      
      <main className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '1.5rem', position: 'relative' }}>
          
          <motion.div
            className="animate-swing"
            style={{ display: 'inline-block', fontSize: '5rem', marginBottom: '-10px', position: 'relative', zIndex: 5, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.6))' }}
          >
            🐒
          </motion.div>
          
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ 
              fontSize: '4.5rem', 
              marginBottom: '1rem', 
              color: 'var(--primary-color)',
              textShadow: '4px 4px 0px var(--wood-dark), 0 0 20px rgba(255,230,0,0.4)',
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
              color: '#fff', 
              fontSize: '1.25rem', 
              maxWidth: '650px', 
              margin: '0 auto', 
              fontWeight: 600,
              background: 'rgba(0,0,0,0.4)',
              padding: '12px 24px',
              borderRadius: '16px',
              border: '2px dashed var(--wood-light)'
            }}
          >
            Feed the monkeys an artist name or a YouTube link, and they'll swing by with high-quality audio tracks! 🌴
          </motion.p>
        </div>

        <div className="grid-2">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
          >
            <div className="glass-panel" style={{ padding: '3rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', fontSize: '2.2rem', color: 'var(--primary-color)', textShadow: '2px 2px 0px var(--wood-dark)' }}>
                <span className="animate-swing" style={{ display: 'inline-block', fontSize: '2.5rem' }}>🦍</span>
                New Safari
              </h2>
              <form onSubmit={handleDownload} className="flex-col" style={{ gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    Artist Name or URL
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 'Gorillaz' or https://youtube.com/..."
                  />
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem', color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    <ListMusic size={22} />
                    Bunch Size
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="input-field"
                    style={{ appearance: 'none' }}
                  >
                    <option value="single">Single Banana 🍌 (1 Track)</option>
                    <option value="top10">Small Bunch 🍌🍌 (Top 10)</option>
                    <option value="top50">Big Bunch 🍌🍌🍌 (Top 50 / Discography)</option>
                    <option value="playlist">Whole Tree 🌴 (Full Playlist URL)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="button-primary" 
                  disabled={!query.trim()} 
                  style={{ width: '100%', marginTop: '1rem', padding: '20px' }}
                >
                  <span className="animate-swing" style={{ display: 'inline-block', fontSize: '1.6rem' }}>🐒</span>
                  Send Monkeys!
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.3 }}
          >
            <div className="glass-panel" style={{ padding: '3rem', minHeight: '100%' }}>
              <h2 style={{ marginBottom: '2rem', fontSize: '2.2rem', color: 'var(--primary-color)', textShadow: '2px 2px 0px var(--wood-dark)' }}>
                Monkey Business 🍌
              </h2>
              
              <div className="flex-col" style={{ gap: '1.5rem' }}>
                <AnimatePresence>
                  {jobs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ textAlign: 'center', color: '#fff', padding: '4rem 2rem', fontWeight: 600, fontSize: '1.2rem', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '2px dashed var(--wood-light)' }}
                    >
                      <div className="animate-swing" style={{ fontSize: '4.5rem', marginBottom: '1rem', display: 'inline-block' }}>💤🐒</div>
                      <br/>
                      The monkeys are sleeping. Give them a job!
                    </motion.div>
                  ) : (
                    jobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                          background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(110, 64, 27, 0.5))',
                          border: '2px solid var(--wood-light)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                        }}
                      >
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                          <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%', fontSize: '1.2rem', color: 'var(--primary-color)', textShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}>
                            {job.query}
                          </span>
                          <span style={{ fontSize: '1.6rem' }}>
                            {job.status === 'downloading' && <span style={{ display: 'inline-block' }} className="animate-swing">🐒</span>}
                            {job.status === 'completed' && <CheckCircle2 size={24} color="var(--success-color)" />}
                            {job.status === 'error' && <AlertCircle size={24} color="var(--error-color)" />}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1rem', fontWeight: 500 }}>
                          {job.status === 'downloading' ? '🍌 Peeling audio...' : job.message}
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
