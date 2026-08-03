'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, CheckCircle2, AlertCircle, Loader2, ListMusic } from 'lucide-react';

interface DownloadJob {
  id: string;
  query: string;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
}

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

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--primary-glow)', borderRadius: '50%', marginBottom: '1rem', border: '2px solid var(--primary-color)' }}
        >
          <span style={{ fontSize: '3rem' }}>🍌</span>
        </motion.div>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Monkey Grabber 🐒
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}
        >
          Feed the monkeys an artist name or a YouTube link, and they'll swing by with high-quality audio tracks! 🌴
        </motion.p>
      </div>

      <div className="grid-2">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1.8rem', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.8rem' }}>🦍</span>
              New Safari
            </h2>
            <form onSubmit={handleDownload} className="flex-col" style={{ gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <ListMusic size={18} />
                  Bunch Size
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="input-field"
                  style={{ cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="single">Single Banana 🍌 (1 Track)</option>
                  <option value="top10">Small Bunch 🍌🍌 (Top 10)</option>
                  <option value="top50">Big Bunch 🍌🍌🍌 (Top 50 / Discography)</option>
                  <option value="playlist">Whole Tree 🌴 (Full Playlist URL)</option>
                </select>
              </div>

              <button type="submit" className="button-primary" disabled={!query.trim()} style={{ width: '100%', marginTop: '1rem', padding: '16px' }}>
                <DownloadCloud size={24} />
                Send Monkeys! 🐒
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-panel" style={{ padding: '2.5rem', minHeight: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', color: 'var(--primary-color)' }}>
              Monkey Business 🍌
            </h2>
            
            <div className="flex-col" style={{ gap: '1rem' }}>
              <AnimatePresence>
                {jobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 2rem', fontWeight: 500 }}
                  >
                    The monkeys are sleeping. Give them a job! 💤🐒
                  </motion.div>
                ) : (
                  jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.2rem',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '0.8rem' }}>
                        <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%', fontSize: '1.1rem' }}>
                          {job.query}
                        </span>
                        <span>
                          {job.status === 'downloading' && <Loader2 size={20} className="animate-spin" color="var(--primary-color)" />}
                          {job.status === 'completed' && <CheckCircle2 size={20} color="var(--success-color)" />}
                          {job.status === 'error' && <AlertCircle size={20} color="var(--error-color)" />}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                        {job.message}
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
  );
}
