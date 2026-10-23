import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Coffee, Send, Sparkles, Star, ChevronLeft, ChevronRight, FolderOpen, X } from 'lucide-react';
import { CONFIG, ASSETS, CUTOUTS } from './config';
import { AudioProvider, useAudio, MusicCard, MiniPlayer } from './audio';
import { addLocalFiles, useResolvedSrc } from './localAssets';

const R = CONFIG.recipient;
const PASTEL = ['#fbcfe8', '#bae6fd', '#fef3c7', '#ddd6fe', '#ffffff', '#a7f3d0'];

/* ---------------- helpers ---------------- */
function Reveal({ children, delay = 0, y = 30, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function Img({ src, alt, className }) {
  const resolved = useResolvedSrc(src);
  const [s, setS] = useState(resolved);
  useEffect(() => setS(resolved), [resolved]);
  return <img src={s} alt={alt} className={className} loading="lazy" onError={() => s !== CONFIG.photos.fallback && setS(CONFIG.photos.fallback)} />;
}

// Anime sticker with white border and a gentle bob
function Sticker({ src, alt, className = '', imgClass = '', rotate = 0, round = false }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [rotate - 2, rotate + 2, rotate - 2] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      className={`bg-white p-1.5 shadow-[0_10px_25px_rgba(0,0,0,.45)] ${round ? 'rounded-full' : 'rounded-xl'} ${className}`}
    >
      <Img src={src} alt={alt} className={`w-full h-full object-cover ${round ? 'rounded-full' : 'rounded-lg'} ${imgClass}`} />
    </motion.div>
  );
}

// Frameless transparent cutout with a soft glow and a gentle bob
function Cutout({ src, alt, className = '', rotate = 0, duration = 4 }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [rotate - 3, rotate + 3, rotate - 3] }}
      transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
      className={`pointer-events-none ${className}`}
    >
      <Img src={src} alt={alt} className="w-full h-auto drop-shadow-[0_0_12px_rgba(200,220,255,.55)]" />
    </motion.div>
  );
}

const SAKURA =confetti.shapeFromText ? confetti.shapeFromText({ text: '🌸', scalar: 2 }) : 'circle';

function Petals({ count = 10 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, k) => (
        <motion.span
          key={k}
          className="absolute text-lg"
          style={{ left: `${(k * 37) % 100}%`, top: -20 }}
          animate={{ y: [0, 900], x: [0, k % 2 ? 40 : -40, 0], rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 9 + (k % 5), delay: k * 0.9, ease: 'linear' }}
        >
          🌸
        </motion.span>
      ))}
    </div>
  );
}

// "📁" button: preview local images / MP3s before copying them into /public
function AssetLoader() {
  const audio = useAudio();
  const ref = useRef(null);
  const [msg, setMsg] = useState('');
  const onPick = (e) => {
    const files = [...(e.target.files || [])];
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    const songs = files.filter((f) => f.type.startsWith('audio/'));
    if (imgs.length) addLocalFiles(imgs);
    songs.forEach((f) => audio.addTrack({ title: f.name.replace(/\.[^.]+$/, ''), artist: 'ローカルファイル', src: URL.createObjectURL(f) }));
    setMsg(`画像 ${imgs.length} ・ 曲 ${songs.length} を読み込みました`);
    setTimeout(() => setMsg(''), 3000);
    e.target.value = '';
  };
  return (
    <div className="fixed top-3 left-3 z-50 sm:left-[calc(50%-14rem+0.75rem)] flex items-center gap-2">
      <button onClick={() => ref.current?.click()} aria-label="PCから画像・MP3を読み込む" title="Load Images/MP3 from PC" className="w-9 h-9 rounded-full bg-navy/70 backdrop-blur ring-1 ring-white/20 flex items-center justify-center opacity-60 hover:opacity-100">
        <FolderOpen className="w-4 h-4" />
      </button>
      <input ref={ref} type="file" multiple accept="image/*,audio/*" className="hidden" onChange={onPick} />
      <AnimatePresence>
        {msg && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] px-2 py-1 rounded-full bg-navy/80">{msg}</motion.span>}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div initial={{ scale: 0.85, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.85 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-white p-3 pb-5 shadow-2xl">
            <button onClick={onClose} aria-label="閉じる" className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-midnight shadow flex items-center justify-center"><X className="w-5 h-5" /></button>
            <Img src={item.src} alt={item.caption} className="w-full max-h-[60vh] object-contain bg-slate-100" />
            <p className="mt-3 text-center font-dancing text-xl text-[#1a2f6b]">{item.caption}</p>
            <p className="mt-2 text-center text-sm leading-6 text-[#1a2f6b] font-maru">{item.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Typewriter({ text, speed = 45, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || n >= text.length) return;
    const t = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [inView, n, text, speed]);
  return (
    <p ref={ref} className={`whitespace-pre-line ${className}`}>
      <span aria-hidden="true">
        {text.slice(0, n)}
        {n < text.length && <span className="caret" />}
      </span>
      <span className="sr-only">{text}</span>
    </p>
  );
}

function Script({ children, className = '' }) {
  return <h2 className={`font-script text-5xl text-moon drop-shadow-[0_0_12px_rgba(180,200,255,.5)] ${className}`}>{children}</h2>;
}

function PlaidStar({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <pattern id="plaid" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#2b4a8c" />
          <rect width="2" height="4" fill="#5b7fd0" opacity=".6" />
          <rect width="4" height="2" fill="#5b7fd0" opacity=".6" />
        </pattern>
      </defs>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z" fill="url(#plaid)" stroke="#cfe0ff" strokeWidth=".6" />
    </svg>
  );
}

const burst = (opts = {}) => confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: PASTEL, scalar: 0.9, ...opts });

/* ---------------- 1. Splash ---------------- */
function Splash({ onOpen }) {
  const audio = useAudio();
  const [opening, setOpening] = useState(false);
  const [flash, setFlash] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    audio.play(); // must run inside the tap handler so mobile browsers allow audio
    setTimeout(() => {
      burst({ origin: { y: 0.5 } });
      burst({ angle: 60, origin: { x: 0, y: 0.7 } });
      burst({ angle: 120, origin: { x: 1, y: 0.7 } });
    }, 500);
    setTimeout(() => setFlash(true), 1500);
    setTimeout(onOpen, 2100);
  };

  return (
    <motion.section className="fixed inset-0 z-40 flex items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="relative w-full max-w-md h-full bg-gradient-to-b from-midnight via-[#16336b] to-[#2a5298] flex flex-col items-center justify-center overflow-hidden">
        <div className="stars" />
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="font-script text-[3.4rem] leading-tight mb-2">
          Happy Birthday
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="font-serifjp text-lg tracking-widest mb-12">
          {R.name} さんへ <span className="text-moon/70">({R.nickname})</span>
        </motion.p>

        <button onClick={open} aria-label="封筒を開く" className="relative w-64 h-44 [perspective:800px] focus:outline-none">
          <motion.div
            className="absolute left-4 right-4 top-4 h-36 rounded-md bg-cream text-midnight flex items-center justify-center font-script text-3xl shadow"
            animate={opening ? { y: -70 } : { y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            For you 🤍
          </motion.div>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#1f3c7a] to-[#132a5a] shadow-[0_20px_50px_rgba(0,0,0,.5)] overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top right, transparent 49.5%, rgba(255,255,255,.08) 50%, transparent 50.5%), linear-gradient(to top left, transparent 49.5%, rgba(255,255,255,.08) 50%, transparent 50.5%)' }} />
          </div>
          <motion.div
            className="absolute left-0 right-0 top-0 h-24 origin-top"
            animate={opening ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full h-full bg-[#28498f]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
          </motion.div>
          <AnimatePresence>
            {!opening && (
              <motion.div exit={{ scale: 0, opacity: 0 }} className="absolute left-[104px] top-[68px] z-30 w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 shadow-lg flex items-center justify-center ring-4 ring-slate-300/40">
                <Heart className="w-6 h-6 text-slate-500 fill-slate-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <motion.p animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-14 text-sm tracking-widest">
          タップして開く <span className="text-moon/60">(Tap to open)</span>
        </motion.p>
      </div>
      <AnimatePresence>{flash && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white z-50" />}</AnimatePresence>
    </motion.section>
  );
}

/* ---------------- 2. Calendar ---------------- */
function Calendar() {
  const [y, m, d] = R.birthday.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <section className="relative px-6 pt-20 pb-12 text-center">
      <Reveal>
        <p className="text-xs tracking-[0.3em] text-moon/60 mb-2">The Day A Wonderful Person Was Born</p>
        <h2 className="font-serifjp text-2xl mb-8">大切な友達が生まれた日</h2>
      </Reveal>
      <Reveal delay={0.2} className="relative">
        <PlaidStar className="absolute -top-6 -left-3 w-12 h-12 rotate-12 animate-pulse" />
        <PlaidStar className="absolute -bottom-6 -right-3 w-14 h-14 -rotate-12" />
        <div className="rounded-3xl bg-gradient-to-br from-[#234a9a] to-[#16336b] p-6 shadow-2xl ring-1 ring-white/15">
          <p className="font-script text-5xl mb-1">October</p>
          <p className="text-sm text-moon/70 mb-4">10月</p>
          <div className="grid grid-cols-7 gap-y-2 text-sm">
            {['日', '月', '火', '水', '木', '金', '土'].map((w) => (
              <span key={w} className="font-bold text-moon/80">{w}</span>
            ))}
            {cells.map((n, i) => (
              <span key={i} className="relative h-8 flex items-center justify-center">
                {n === d ? (
                  <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="relative flex items-center justify-center">
                    <svg viewBox="0 0 40 44" className="w-10 h-11 -mt-3 drop-shadow-[0_0_10px_rgba(255,255,255,.9)]" aria-hidden="true">
                      <path d="M20 2c2 3 3 5 0 8-3-3-2-5 0-8z" fill="#fde68a" />
                      <rect x="18.5" y="9" width="3" height="7" rx="1" fill="#fbcfe8" />
                      <rect x="9" y="15" width="22" height="9" rx="3" fill="#fff" />
                      <path d="M9 20q3 3 5.5 0t5.5 0 5.5 0 5.5 0" fill="none" stroke="#fbcfe8" strokeWidth="2" />
                      <rect x="4" y="24" width="32" height="16" rx="3" fill="#fff" />
                      <rect x="2" y="39" width="36" height="3" rx="1.5" fill="#cfe0ff" />
                    </svg>
                    <span className="absolute bottom-[3px] text-[#16336b] font-bold text-xs">{n}</span>
                  </motion.span>
                ) : (
                  n
                )}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.4}>
        <span className="inline-block mt-8 px-4 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-xs tracking-wider">
          {y}.{m}.{d} — {R.origin}
        </span>
      </Reveal>
      <Reveal delay={0.3} className="mt-8 flex flex-col items-center">
        <Cutout src={CUTOUTS.frierenChibi22} alt="22歳のケーキを持つフリーレン" className="w-36" rotate={-4} />
        <p className="mt-4 font-dancing text-xl">Happy 22nd Birthday, Momo-chan! 🎂✨</p>
      </Reveal>
    </section>
  );
}

/* ---------------- 3. Music ---------------- */
function MusicSection() {
  return (
    <section className="px-6 py-12 text-center">
      <Reveal>
        <Script className="text-4xl mb-2">Turn on the music!</Script>
        <p className="text-sm mb-6">まずは音楽を聴きながらスクロールしてね！🎵</p>
      </Reveal>
      <Reveal delay={0.2} className="relative">
        <Cutout src={CUTOUTS.nagisaCake} alt="ケーキと渚" className="absolute -bottom-14 -right-3 w-20 z-20" rotate={6} duration={5} />
        <MusicCard />
      </Reveal>
    </section>
  );
}

/* ---------------- 4. Camera + Notepad + Cake ---------------- */
function Camera() {
  const photos = CONFIG.photos.camera;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), 3200);
    return () => clearInterval(t);
  }, [photos.length, i]);
  const step = (dir) => setI((v) => (v + dir + photos.length) % photos.length);
  return (
    <div className="relative mx-auto w-full max-w-[330px]">
      <div className="h-4 w-20 ml-8 rounded-t-lg bg-[#2f5bc4]" />
      <div className="relative rounded-2xl bg-gradient-to-br from-[#3a6ad6] via-[#2b55b8] to-[#1d3f94] p-3 pr-24 shadow-[0_20px_40px_rgba(0,0,0,.5)] ring-1 ring-white/20">
        <div className="relative aspect-[4/3] rounded-lg bg-black overflow-hidden ring-4 ring-[#14306e]">
          <AnimatePresence initial={false}>
            <motion.div key={i} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0">
              {/\.(mp4|webm)$/i.test(photos[i]) ? (
                <video src={photos[i]} className="w-full h-full object-cover object-center" autoPlay muted loop playsInline aria-label={`${R.nickname}の動画`} />
              ) : (
                <Img src={photos[i]} alt={`${R.nickname}の写真`} className="w-full h-full object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-2 pointer-events-none text-white text-[9px] font-mono">
            {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c) => (
              <span key={c} className={`absolute w-4 h-4 border-white/80 ${c}`} />
            ))}
            <span className="absolute top-1 left-5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />REC</span>
            <span className="absolute top-1 right-5">▮▮▮</span>
            <span className="absolute bottom-1 right-5">2026.10.24</span>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/60 rounded-sm" />
          </div>
        </div>
        <div className="absolute right-3 top-3 w-[76px] flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 p-1.5 shadow-inner">
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_35%,#6aa0ff,#0b1d45_60%,#000)] ring-2 ring-slate-700" />
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => step(-1)} aria-label="前の写真" className="w-7 h-7 rounded-full bg-slate-200 text-[#173a88] shadow flex items-center justify-center active:scale-90"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => step(1)} aria-label="次の写真" className="w-7 h-7 rounded-full bg-slate-200 text-[#173a88] shadow flex items-center justify-center active:scale-90"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <span className="text-[9px] text-white/70 font-mono">{i + 1}/{photos.length}</span>
        </div>
      </div>
    </div>
  );
}

function Cake() {
  const [blown, setBlown] = useState(false);
  const blow = () => {
    if (blown) return;
    setBlown(true);
    burst({ particleCount: 90, origin: { y: 0.7 }, shapes: ['star'], colors: ['#fde68a', '#ffffff', '#bae6fd', '#fbcfe8'] });
  };
  return (
    <div className="flex flex-col items-center mt-12">
      <button onClick={blow} aria-label="ろうそくを吹き消す" className="relative flex flex-col items-center focus:outline-none active:scale-95 transition">
        <div className="flex justify-center gap-5 h-14 items-end">
          {[0, 1, 2].map((k) => (
            <div key={k} className="relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                {!blown ? (
                  <motion.span key="f" exit={{ opacity: 0, scale: 0 }} className="flame block w-3 h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-orange-400 via-yellow-300 to-white shadow-[0_0_14px_6px_rgba(255,200,80,.6)]" />
                ) : (
                  <motion.span key="s" initial={{ opacity: 0.8, y: 0 }} animate={{ opacity: 0, y: -24 }} transition={{ duration: 1.4 }} className="block w-3 h-5 rounded-full bg-slate-300/60 blur-[2px]" />
                )}
              </AnimatePresence>
              <span className="block w-2 h-8 rounded-sm bg-[repeating-linear-gradient(45deg,#fff_0_4px,#93c5fd_4px_8px)]" />
            </div>
          ))}
        </div>
        <div className="w-36 h-10 rounded-t-xl bg-gradient-to-b from-white to-sky-100" />
        <div className="w-48 h-14 rounded-t-lg bg-gradient-to-b from-[#5d8ee8] to-[#2b55b8] flex items-center justify-center text-white/90 text-xs tracking-[0.3em] border-t-4 border-white">
          HAPPY {R.age}
        </div>
        <div className="w-56 h-3 rounded-full bg-slate-200/80" />
      </button>
      <AnimatePresence mode="wait">
        {blown ? (
          <motion.p key="w" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-sm text-center leading-relaxed">
            🌠 願いごとがきっと叶いますように！<br />
            <span className="text-moon/60 text-xs">Your wish is on its way ✨</span>
          </motion.p>
        ) : (
          <motion.p key="h" exit={{ opacity: 0 }} className="mt-5 text-xs text-moon/70 animate-pulse">
            ケーキをタップしてろうそくを吹き消してね 🎂
          </motion.p>
        )}
      </AnimatePresence>

      {/* Decoration only */}
      <motion.div
        animate={{ boxShadow: ['0 0 25px 4px rgba(147,197,253,.45)', '0 0 45px 10px rgba(251,207,232,.55)', '0 0 25px 4px rgba(147,197,253,.45)'] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="relative mt-10 w-full max-w-[320px] rounded-2xl p-1.5 bg-gradient-to-br from-sky-200 via-white to-pink-200"
      >
        <Img src={ASSETS.frierenCakeGif} alt="ケーキを囲んでお祝いするフリーレンたち" className="w-full rounded-xl" />
        <Sparkles className="absolute -top-3 -left-3 w-7 h-7 text-yellow-200 animate-pulse" />
        <Star className="absolute -bottom-3 -right-3 w-7 h-7 text-white fill-white/80 animate-pulse" />
      </motion.div>
    </div>
  );
}

function AllAboutYou() {
  const text =
    '今日はあなたのための特別な日。\nこれまで乗り越えてきたたくさんのこと、そしてこれから待っている素晴らしい未来を祝う日です。\n新しい一歳が、ももちゃんにとって笑顔と幸せでいっぱいの毎日になりますように！';
  return (
    <section className="px-6 py-14 text-center">
      <Reveal>
        <p className="text-xs tracking-[0.3em] text-moon/60 mb-2">Today is All About You</p>
        <h2 className="font-serifjp text-2xl mb-8">今日は{R.nickname}が主役の日！</h2>
      </Reveal>
      <Reveal delay={0.1} className="relative">
        <Camera />
        <Sticker src={ASSETS.inazumaBirthday} alt="イナズマイレブンのバースデーイラスト" className="absolute -bottom-36 left-4 w-32 h-32 z-20" rotate={-6} />
        <Cutout src={CUTOUTS.momokoKimono} alt={`着物姿の${R.nickname}`} className="absolute -bottom-36 right-2 w-24 z-20" rotate={4} duration={5} />
      </Reveal>
      <Reveal delay={0.2}>
        <div className="relative mx-auto mt-40 max-w-[320px] rotate-[-1.5deg]">
          <div className="absolute -top-3 left-4 right-4 flex justify-between z-10">
            {Array.from({ length: 12 }).map((_, k) => (
              <span key={k} className="w-2.5 h-6 rounded-full border-2 border-slate-500 bg-gradient-to-b from-slate-200 to-slate-400" />
            ))}
          </div>
          <div className="rounded-md bg-white text-[#1a2f6b] px-5 pt-8 pb-6 shadow-[0_15px_30px_rgba(0,0,0,.45)] notepad-lines text-left">
            <Typewriter text={text} speed={40} className="font-maru text-[15px] leading-8 min-h-[12rem]" />
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <Cake />
      </Reveal>
    </section>
  );
}

/* ---------------- 5. Letter ---------------- */
function Letter() {
  return (
    <section className="gingham px-6 py-16 text-center relative overflow-hidden">
      <Reveal>
        <Script>A Little Letter</Script>
        <p className="font-serifjp text-sm mt-1 mb-6">小さな手紙</p>
      </Reveal>
      <Reveal className="flex justify-end pr-2 -mb-10 relative z-40">
        <Cutout src={CUTOUTS.frierenFernCard} alt="フリーレンとフェルンのバースデーカード" className="w-32" rotate={8} />
      </Reveal>
      <div className="relative mx-auto max-w-[330px] pt-6">
        <div className="absolute left-0 right-0 bottom-0 h-40 rounded-lg bg-[#1f3c7a] shadow-2xl" />
        <div className="absolute left-0 right-0 bottom-40 h-16 bg-[#28498f]" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="relative z-30 mx-5 mb-16 rounded-md bg-cream text-[#1a2f6b] p-6 text-left shadow-xl font-maru text-[15px] leading-7"
        >
          <p>{R.nickname}、お誕生日おめでとう！</p>
          <p>すべて順調にいってるといいな。いつも健康でいてね。</p>
          <p>これからもっといいことがたくさんありますように！</p>
          <p>もし何かあったらいつでも力になるから、頼れる友達でいられたらいいな！</p>
          <p className="text-right mt-3 font-bold">— {CONFIG.sender.name} ({CONFIG.sender.nameRomaji}) より</p>
        </motion.div>
        <div className="absolute left-0 right-0 bottom-0 h-24 z-20 rounded-b-lg bg-gradient-to-t from-[#16336b] to-[#1f3c7a]" style={{ clipPath: 'polygon(0 0, 50% 45%, 100% 0, 100% 100%, 0 100%)' }} />
        <motion.span animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -left-4 bottom-2 z-40 text-6xl drop-shadow-lg" aria-hidden="true">💐</motion.span>
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -right-2 bottom-10 z-40 text-4xl drop-shadow-[0_0_10px_rgba(200,220,255,.8)]" aria-hidden="true">🤍</motion.span>
        <Star className="absolute -right-3 bottom-2 z-30 w-6 h-6 text-white fill-white/70 animate-pulse" />
      </div>
      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-col items-center">
          <div className="flex items-end justify-center gap-8">
            <Sticker src={ASSETS.taigaAngel} alt="天使の大河のバースデーイラスト" className="w-28 h-32" rotate={-5} />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="relative text-7xl" aria-hidden="true">
              🧸<span className="absolute -right-6 bottom-0 text-4xl">🎂</span>
            </motion.div>
          </div>
          <div className="mt-6 rounded-xl border-2 border-dashed border-white/60 bg-midnight/40 px-5 py-4 text-sm leading-relaxed max-w-[300px]">
            {R.nickname}にたくさんの幸せが訪れますように ✨
            <span className="block text-xs text-moon/70 mt-1">You deserve all the good things coming your way.</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- 6. Moon & Polaroids ---------------- */
function Polaroid({ p, i, onOpen }) {
  const left = i % 2 === 0;
  const tilt = [-6, 5, -3, 7, -5][i % 5];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9 }}
      className={`w-40 ${left ? 'self-start ml-2' : 'self-end mr-2'} ${i ? '-mt-8' : ''}`}
    >
      <motion.button
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4 + i * 0.4 }}
        onClick={() => onOpen(p)}
        aria-label={`${p.caption}の思い出を見る`}
        className="relative block w-40 h-52"
      >
        <div className="absolute inset-0 bg-white p-2 pb-10 shadow-[0_12px_25px_rgba(0,0,0,.5)]">
          <Img src={p.src} alt={p.caption} className="w-full h-full object-cover" />
          <p className="absolute bottom-2 left-0 right-0 px-1 truncate text-center text-[#1a2f6b] font-dancing text-sm">{p.caption}</p>
        </div>
      </motion.button>
    </motion.div>
  );
}

function Memories() {
  const [open, setOpen] = useState(null);
  return (
    <section className="relative px-6 pt-16 pb-16 text-center bg-gradient-to-b from-midnight via-[#0d2048] to-[#132d5e] overflow-hidden">
      <div className="stars" />
      <Reveal>
        <h2 className="font-serifjp text-xl leading-relaxed">2026年、台北で出会えて<br />本当によかった！✨</h2>
        <p className="font-serifjp text-sm text-moon/80 mt-3">沖縄での時間も楽しんできてね〜！</p>
      </Reveal>
      <div className="relative">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.6 }} className="moon w-52 h-52 rounded-full mx-auto my-12" />
        <Cutout src={CUTOUTS.frierenPartyHat} alt="パーティー帽子のフリーレン" className="absolute bottom-6 -left-2 w-24" rotate={-8} />
      </div>
      <p className="text-xs text-moon/60 mb-6">写真をタップすると思い出が見られるよ 📸</p>
      <div className="flex flex-col">
        {CONFIG.polaroids.map((p, i) => (
          <Polaroid key={i} p={p} i={i} onOpen={setOpen} />
        ))}
      </div>
      <Lightbox item={open} onClose={() => setOpen(null)} />
      <Reveal className="relative mt-14">
        <motion.div animate={{ x: [-30, 30, -30], y: [0, -12, 0], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 6 }} className="inline-block mb-4">
          <Send className="w-8 h-8 text-moon -rotate-12" />
        </motion.div>
        <p className="font-serifjp text-sm leading-7">
          いつも明るい笑顔に元気もらってるよ！😊<br />これからもよろしくね！
        </p>
        <p className="text-xs text-moon/60 mt-1">May your days always shine brightly.</p>
      </Reveal>
    </section>
  );
}

/* ---------------- 7. Long message ---------------- */
function VintageCar({ className }) {
  return (
    <svg viewBox="0 0 120 50" className={className} aria-hidden="true">
      <path d="M8 34 Q8 26 18 25 L34 24 Q42 12 58 11 L76 11 Q88 12 95 24 L108 26 Q114 28 114 34 L114 38 L8 38 Z" fill="#3a5fb0" stroke="#cfe0ff" strokeWidth="1" />
      <path d="M40 24 Q46 15 58 15 L64 15 L64 24 Z M68 15 L76 15 Q85 16 90 24 L68 24 Z" fill="#a9c4f5" opacity=".8" />
      <rect x="6" y="35" width="110" height="3" rx="1.5" fill="#cfd8e8" />
      <circle cx="30" cy="39" r="8" fill="#0a192f" stroke="#cfd8e8" strokeWidth="2" />
      <circle cx="92" cy="39" r="8" fill="#0a192f" stroke="#cfd8e8" strokeWidth="2" />
      <circle cx="30" cy="39" r="2.5" fill="#cfd8e8" />
      <circle cx="92" cy="39" r="2.5" fill="#cfd8e8" />
      <circle cx="111" cy="30" r="2" fill="#fde68a" />
    </svg>
  );
}

function LongMessage() {
  return (
    <section className="px-6 py-16 text-center bg-[#132d5e] overflow-hidden">
      <Reveal>
        <div className="flex items-center justify-center gap-3">
          <Script>Message for you</Script>
          <div className="relative">
            <motion.div animate={{ opacity: [0, 0.8, 0], y: [0, -10] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-4 left-2 text-moon/70 text-xs">~ ~</motion.div>
            <Coffee className="w-8 h-8 text-moon" />
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="relative mt-14 rounded-[2rem] bg-midnight/70 ring-1 ring-slate-300/60 px-6 pt-12 pb-20 text-left text-[15px] leading-8 font-maru shadow-2xl">
          <Cutout src={CUTOUTS.frierenScarf} alt="マフラーを巻いたフリーレン" className="absolute -top-16 -right-3 w-20" rotate={8} />
          <p className="mb-4">{R.nickname}、誕生日おめでとう！🎂🎉</p>
          <p className="mb-4">台北で一緒に中国語勉強できてすごく楽しいよ！友達になれてよかった😊</p>
          <p className="mb-4">この1年が{R.nickname}にとって最高の一年になりますように！</p>
          <p>沖縄での時間も満喫してね〜✨</p>
          <motion.div initial={{ x: -160 }} whileInView={{ x: 0 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: 'easeOut' }} className="absolute bottom-1 left-6">
            <VintageCar className="w-32" />
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- 8. Finale ---------------- */
function Finale() {
  const celebrate = () => {
    const end = Date.now() + 3000;
    const colors = [...PASTEL, '#93c5fd', '#fda4af'];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    [0.2, 0.5, 0.8].forEach((x, k) =>
      setTimeout(() => confetti({ particleCount: 150, spread: 360, startVelocity: 35, ticks: 90, origin: { x, y: 0.3 }, colors, shapes: ['star', 'circle'] }), k * 450),
    );
    setTimeout(() => confetti({ particleCount: 40, spread: 160, startVelocity: 25, gravity: 0.5, scalar: 1.6, origin: { y: 0.2 }, shapes: [SAKURA] }), 900);
  };
  return (
    <section className="relative px-6 pt-16 pb-28 text-center bg-gradient-to-b from-[#132d5e] to-midnight overflow-hidden">
      <div className="stars" />
      <Petals />
      <Reveal>
        <Script>One Last Thing</Script>
        <p className="font-serifjp text-sm mt-1 mb-12">最後にひとつだけ</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative mx-auto w-52 h-64">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 text-4xl" aria-hidden="true">🥳</span>
          <div className="absolute inset-0 rounded-[50%] bg-gradient-to-br from-slate-200 via-slate-400 to-slate-200 p-2 shadow-[0_0_40px_rgba(180,200,255,.4)]">
            <div className="w-full h-full rounded-[50%] border-4 border-dotted border-white/80 p-1.5 bg-[#1d3f94]">
              <Img src={CONFIG.photos.portrait} alt={R.nickname} className="w-full h-full rounded-[50%] object-cover" />
            </div>
          </div>
          <span className="absolute -bottom-2 -left-3 text-4xl" aria-hidden="true">🎂</span>
          <Cutout src={CUTOUTS.nagisaSakura} alt="笑顔の渚" className="absolute -bottom-6 -right-14 w-28" rotate={6} />
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-12 rounded-3xl bg-white/10 backdrop-blur ring-1 ring-white/25 p-6 text-[15px] leading-8 font-maru">
          <p>出会ってくれて、そして友達になってくれて本当にありがとう！</p>
          <p className="mt-2">{R.age}歳の一年が、健康と笑顔、そして夢が叶う素晴らしい一年になりますように。</p>
          <p className="mt-4 font-bold">Happy Birthday, {R.nameRomaji} ({R.name})! 🎉</p>
          <p className="mt-4 font-bold">{CONFIG.sender.name} ({CONFIG.sender.nameRomaji})</p>
        </div>
      </Reveal>
      <Reveal delay={0.3}>
        <motion.button whileTap={{ scale: 0.94 }} onClick={celebrate} className="mt-10 px-7 py-4 rounded-full bg-gradient-to-r from-pink-300 via-white to-sky-300 text-midnight font-bold shadow-[0_0_30px_rgba(255,255,255,.4)]">
          もう一度お祝いする 🎉
          <span className="block text-[11px] font-normal">Celebrate Again</span>
        </motion.button>
      </Reveal>
      <p className="mt-16 text-[10px] text-moon/40">Made with 🤍 by {CONFIG.sender.nameRomaji} · 2026.10.24</p>
    </section>
  );
}

/* ---------------- App ---------------- */
function Site() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <div className="page-bg" />
      <AnimatePresence>{!opened && <Splash key="splash" onOpen={() => setOpened(true)} />}</AnimatePresence>
      {opened && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="max-w-md mx-auto min-h-screen relative overflow-x-hidden shadow-2xl bg-gradient-to-b from-midnight via-navy to-midnight">
          <div className="stars" />
          <Calendar />
          <MusicSection />
          <AllAboutYou />
          <Letter />
          <Memories />
          <LongMessage />
          <Finale />
        </motion.main>
      )}
      {opened && <MiniPlayer />}
      {opened && <AssetLoader />}
    </>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <Site />
    </AudioProvider>
  );
}
