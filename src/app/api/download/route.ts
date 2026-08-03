import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { query, id, mode = 'single' } = await req.json();

    if (!query) {
      return new Response('Missing query', { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const sendUpdate = (data: any) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        const isUrl = query.startsWith('http://') || query.startsWith('https://');
        
        let downloadTarget = query;
        let noPlaylist = true;

        if (!isUrl) {
          if (mode === 'single') downloadTarget = `ytsearch:${query}`;
          else if (mode === 'top10') { downloadTarget = `ytsearch10:${query}`; noPlaylist = false; }
          else if (mode === 'top50') { downloadTarget = `ytsearch50:${query}`; noPlaylist = false; }
        } else {
          if (mode === 'playlist' || mode === 'top10' || mode === 'top50') noPlaylist = false;
        }

        const downloadsDir = path.join(os.homedir(), 'MusicDownloader');
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        sendUpdate({ status: 'downloading', progress: 0, message: 'Finding tracks...' });

        const args = [
          downloadTarget,
          '-x',
          '--audio-format', 'opus',
          '--audio-quality', '0',
          '--paths', downloadsDir,
          '-o', '%(artist,uploader)s/%(title)s [%(id)s].%(ext)s',
        ];

        if (noPlaylist) {
          args.push('--no-playlist');
        } else {
          args.push('--yes-playlist');
        }

        const child = spawn('yt-dlp', args);

        child.stdout.on('data', (data) => {
          const str = data.toString();
          const match = str.match(/\[download\]\s+(\d+\.?\d*)%/);
          if (match && match[1]) {
            sendUpdate({ status: 'downloading', progress: parseFloat(match[1]), message: 'Downloading...' });
          } else if (str.includes('[ExtractAudio]')) {
            sendUpdate({ status: 'downloading', progress: 100, message: 'Extracting audio...' });
          } else if (str.includes('[download] Downloading video')) {
            sendUpdate({ status: 'downloading', progress: 0, message: 'Moving to next track...' });
          }
        });

        child.stderr.on('data', (data) => {
          console.error(`yt-dlp stderr: ${data}`);
        });

        child.on('close', (code) => {
          if (code === 0) {
            sendUpdate({ status: 'completed', progress: 100, message: 'Download finished! Check your MusicDownloader folder.' });
          } else {
            sendUpdate({ status: 'error', progress: 0, message: `Process exited with code ${code}. Is yt-dlp installed?` });
          }
          controller.close();
        });

        child.on('error', (err) => {
          sendUpdate({ status: 'error', progress: 0, message: `Failed to start yt-dlp: ${err.message}` });
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
