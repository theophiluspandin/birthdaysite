import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Music2, Upload, Link2, ListMusic, X } from 'lucide-react';
import { CONFIG, ASSETS } from './config';
import { useResolvedSrc } from './localAssets';

const AudioCtx = createContext(null);
export const useAudio = () => useContext(AudioCtx);

// One <audio> element lives at the app root, so music never stops while scrolling.
export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(CONFIG.playlist);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ cur: 0, dur: 0 });
  const [mode, setMode] = useState('player'); // 'player' | 'spotify'
  const wantPlay = useRef(false);
  const failures = useRef(0);

  const track = tracks[index];

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !wantPlay.current) return;
    a.play().catch(() => setPlaying(false));
  }, [index, track?.src]);

  const play = () => {
    wantPlay.current = true;
    setMode('player');
    return audioRef.current?.play().catch(() => setPlaying(false));
  };
  const pause = () => {
    wantPlay.current = false;
    audioRef.current?.pause();
  };
  const toggle = () => (playing ? pause() : play());
  const go = (i) => {
    wantPlay.current = true;
    setMode('player');
    setIndex(((i % tracks.length) + tracks.length) % tracks.length);
  };
  const next = () => go(index + 1);
  const prev = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) audioRef.current.currentTime = 0;
    else go(index - 1);
  };
  const seek = (ratio) => {
    const a = audioRef.current;
    if (a && a.duration) a.currentTime = ratio * a.duration;
  };
  const addTrack = (t) => {
    wantPlay.current = true;
    setMode('player');
    setTracks((list) => {
      setIndex(list.length);
      return [...list, t];
    });
  };
  const switchMode = (m) => {
    if (m === 'spotify') pause();
    setMode(m);
  };

  return (
    <AudioCtx.Provider value={{ tracks, index, track, playing, progress, mode, play, pause, toggle, next, prev, go, seek, addTrack, switchMode }}>
      <audio
        ref={audioRef}
        src={track?.src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
        onPlaying={() => (failures.current = 0)}
        onError={() => {
          // Missing/broken file: skip to the next track (stop if every track fails)
          failures.current += 1;
          if (failures.current < tracks.length) next();
        }}
        onTimeUpdate={(e) => setProgress({ cur: e.target.currentTime, dur: e.target.duration || 0 })}
        onLoadedMetadata={(e) => setProgress({ cur: 0, dur: e.target.duration || 0 })}
      />
      {children}
    </AudioCtx.Provider>
  );
}

const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

function Vinyl({ spinning }) {
  const label = useResolvedSrc(ASSETS.frierenChibi22);
  return (
    <div className={`relative w-28 h-28 rounded-full vinyl shadow-xl animate-spin-slow ${spinning ? '' : 'paused'}`}>
      <div className="absolute inset-[26%] rounded-full overflow-hidden ring-2 ring-black/60 flex items-center justify-center">
        <img src={label} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative w-2 h-2 rounded-full bg-midnight ring-1 ring-white/60" />
      </div>
    </div>
  );
}

// Section 3: Spotify-inspired card with vinyl
export function MusicCard() {
  const a = useAudio();
  const [showList, setShowList] = useState(false);
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);
  const ratio = a.progress.dur ? a.progress.cur / a.progress.dur : 0;

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    a.addTrack({ title: f.name.replace(/\.[^.]+$/, ''), artist: 'ローカルファイル', src: URL.createObjectURL(f) });
    e.target.value = '';
  };
  const onUrl = (e) => {
    e.preventDefault();
    const u = url.trim();
    if (!/^https?:\/\//.test(u)) return;
    a.addTrack({ title: decodeURIComponent(u.split('/').pop().split('?')[0]) || 'Custom Audio', artist: 'カスタムURL', src: u });
    setUrl('');
  };

  return (
    <div className="w-full">
      <div className="flex mx-auto mb-4 w-fit rounded-full bg-white/10 p-1 text-xs">
        {[['player', '🎵 プレイヤー'], ['spotify', 'Spotify']].map(([m, label]) => (
          <button key={m} onClick={() => a.switchMode(m)} className={`px-4 py-1.5 rounded-full transition ${a.mode === m ? 'bg-white text-midnight font-bold' : 'text-moon/80'}`}>
            {label}
          </button>
        ))}
      </div>

      {a.mode === 'spotify' ? (
        <iframe
          title="Spotify"
          src={CONFIG.spotifyEmbedUrl}
          width="100%"
          height="152"
          className="rounded-2xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <div className="relative pl-14">
          <div className="absolute left-0 top-6 z-0">
            <Vinyl spinning={a.playing} />
          </div>
          <div className="relative z-10 rounded-2xl bg-gradient-to-br from-[#2446c9] to-[#1a2f8a] p-4 shadow-2xl ring-1 ring-white/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 shrink-0 rounded-lg bg-white/15 flex items-center justify-center">
                <Music2 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{a.track?.title}</p>
                <p className="text-xs text-moon/70 truncate">{a.track?.artist}</p>
              </div>
              <button aria-label="プレイリスト" onClick={() => setShowList((v) => !v)} className="p-1.5 rounded-full hover:bg-white/10">
                <ListMusic className="w-5 h-5" />
              </button>
            </div>

            <div
              className="mt-4 h-1.5 rounded-full bg-white/20 cursor-pointer"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                a.seek((e.clientX - r.left) / r.width);
              }}
            >
              <div className="h-full rounded-full bg-white" style={{ width: `${ratio * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-moon/60">
              <span>{fmt(a.progress.cur)}</span>
              <span>{fmt(a.progress.dur)}</span>
            </div>

            <div className="mt-1 flex items-center justify-center gap-6">
              <button aria-label="前の曲" onClick={a.prev}><SkipBack className="w-6 h-6" /></button>
              <button aria-label={a.playing ? '一時停止' : '再生'} onClick={a.toggle} className="w-12 h-12 rounded-full bg-white text-[#1a2f8a] flex items-center justify-center shadow-lg active:scale-95 transition">
                {a.playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button aria-label="次の曲" onClick={a.next}><SkipForward className="w-6 h-6" /></button>
            </div>

            <AnimatePresence>
              {showList && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <ul className="mt-4 space-y-1 text-sm">
                    {a.tracks.map((t, i) => (
                      <li key={t.src + i}>
                        <button onClick={() => a.go(i)} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between gap-2 ${i === a.index ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
                          <span className="truncate">{i === a.index && a.playing ? '▶ ' : `${i + 1}. `}{t.title}</span>
                          <span className="text-[10px] text-moon/60 shrink-0 self-center">{t.artist}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-white/15 space-y-2">
                    <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <Upload className="w-4 h-4" /> ローカルのMP3を選ぶ (Choose Local MP3)
                    </button>
                    <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={onFile} />
                    <form onSubmit={onUrl} className="flex gap-2">
                      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/song.mp3" className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg bg-white/10 placeholder:text-moon/40 outline-none focus:ring-1 ring-white/50" />
                      <button type="submit" aria-label="URLを追加" className="px-3 rounded-lg bg-white/10 hover:bg-white/20"><Link2 className="w-4 h-4" /></button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// Floating controller (bottom-right), available everywhere
export function MiniPlayer() {
  const a = useAudio();
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:right-[calc(50%-14rem+1rem)]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-64 rounded-2xl bg-navy/95 backdrop-blur ring-1 ring-white/20 p-3 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-moon/70">{a.mode === 'spotify' ? 'Spotifyモード' : 'いま再生中'}</p>
              <button aria-label="閉じる" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="font-bold text-sm truncate">{a.track?.title}</p>
            <p className="text-[11px] text-moon/60 truncate mb-2">{a.track?.artist}</p>
            <div className="flex items-center justify-center gap-5 mb-2">
              <button aria-label="前の曲" onClick={a.prev}><SkipBack className="w-5 h-5" /></button>
              <button aria-label={a.playing ? '一時停止' : '再生'} onClick={a.toggle} className="w-10 h-10 rounded-full bg-white text-midnight flex items-center justify-center">
                {a.playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button aria-label="次の曲" onClick={a.next}><SkipForward className="w-5 h-5" /></button>
            </div>
            <ul className="max-h-32 overflow-y-auto text-xs space-y-0.5">
              {a.tracks.map((t, i) => (
                <li key={t.src + i}>
                  <button onClick={() => a.go(i)} className={`w-full text-left px-2 py-1.5 rounded truncate ${i === a.index ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
                    {i + 1}. {t.title}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        aria-label="ミュージックプレイヤーを開く"
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full shadow-2xl ring-2 ring-white/30 overflow-hidden"
      >
        <div className={`absolute inset-0 vinyl animate-spin-slow ${a.playing ? '' : 'paused'}`}>
          <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-pink-300 to-sky-300" />
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-midnight">
          {a.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </span>
      </button>
    </div>
  );
}
