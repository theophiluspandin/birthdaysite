// =====================================================================
//  CONFIG — edit everything here. Photos live in /public/photos,
//  anime decorations in /public/images, music in /public/music.
//  Replace the files (keep the names) or change the paths below.
//  Any https:// URL (e.g. Unsplash) also works.
// =====================================================================

// Anime decoration images (files in /public/images, exact original filenames).
// The "📁" button on the site can also load these from your PC by filename.
export const ASSETS = {
  frierenCakeGif: '/images/frieren-birthday.gif',
  frierenChibi22: '/images/images (1).jpeg',
  nagisaCake: '/images/7w3b9ost01761.jpg',
  frierenFernCard: '/images/il_fullxfull.7824593722_i3bz.jpg',
  clannadPopup: '/images/1792756235918.png',
  frierenPartyHat: '/images/images (2).jpeg',
  frierenScarf: '/images/images.jpeg',
  nagisaSakura: '/images/unnamed.png',
  inazumaBirthday: '/images/5e9688b6b92ef5d51ba047f2732ea304.jpg',
  taigaAngel: '/images/images (3).jpeg',
};

// Background-removed cutouts (transparent PNGs in /public/images/cutouts), used as floating stickers.
export const CUTOUTS = {
  frierenChibi22: '/images/cutouts/frieren-chibi-22.png',
  frierenFernCard: '/images/cutouts/card-letter.png', // from Photos/IMG_20261024_003447.jpg (black made transparent)
  frierenPartyHat: '/images/cutouts/frieren-party-hat.png',
  frierenScarf: '/images/cutouts/frieren-scarf.png',
  nagisaCake: '/images/cutouts/nagisa-cake.png',
  nagisaSakura: '/images/cutouts/nagisa-sakura.png',
  momokoKimono: '/images/cutouts/momoko-kimono.png',
};

export const CONFIG = {
  recipient: {
    name: '勢力 桃子',
    nameRomaji: 'Momoko Seiriki',
    nickname: 'ももちゃん',
    birthday: '2004-10-24',
    age: 22,
    origin: 'Okinawa, Japan 🌺',
  },
  sender: { name: 'てお', nameRomaji: 'Teo', country: 'インドネシア' },

  photos: {
    // Retro camera LCD slideshow (use the < > buttons on the camera)
    camera: ['/photos/photo1.jpg', '/photos/photo4.jpg', '/photos/photo3.jpg', '/photos/photo2.jpg', '/photos/camera-video.mp4'], // .mp4 entries play as muted looping video
    // Oval portrait in the final section
    portrait: '/photos/photo1.jpg',
    // Used automatically if a photo above fails to load
    fallback: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
  },

  // Tap a polaroid to open it full-screen with its note
  polaroids: [
    { src: '/photos/photo4.jpg', caption: 'Okinawa Vibes 🌺', note: '沖縄の太陽みたいに、いつも周りを明るくしてくれるももちゃん。浴衣姿もとっても素敵！' },
    { src: '/photos/photo3.jpg', caption: 'Taipei 2026 🏮', note: '九份の赤い提灯の夜。台北で過ごした時間は、ずっと忘れない思い出です。' },
    { src: '/photos/photo2.jpg', caption: 'Summer Fireworks 🎆', note: '浴衣で見た花火の夜。ももちゃんの毎日が、花火みたいにキラキラ輝きますように！' },
    { src: '/photos/photo5.jpg', caption: 'Mandarin Class 🍕📚', note: '中国語クラスのピザパーティー！一緒に勉強できて本当に楽しかった。' },
    { src: '/photos/photo1.jpg', caption: 'Beautiful Smile ✨', note: 'ももちゃんの笑顔は、まわりのみんなを元気にしてくれる魔法みたい。' },
  ],

  // Built-in playlist (original royalty-free tracks made by scripts/generate-music.mjs).
  // Drop your own .mp3 into /public/music and add an entry, or use any https:// audio URL.
  // The first track plays when the envelope is opened. If a file is missing,
  // the player skips it automatically and plays the next track.
  playlist: [
    { title: "Momoko's Birthday from Fern", artist: 'ももちゃんへ 🎂', src: "/music/Momoko's Birthday from Fern.mp3" },
    { title: "Momoko's Birthday from 中学聖日記", artist: 'ももちゃんへ 🎂', src: "/music/Momoko's Birthday from 中学聖日記.mp3" },
    { title: 'Happy Birthday To You', artist: 'Official髭男dism', src: '/music/Official hige dandism - Happy Birthday To You.mp3' },
    { title: 'Happy Birthday Waltz', artist: 'Acoustic Warm Lo-Fi', src: '/music/track1.mp3' },
    { title: 'Okinawa Island Breeze', artist: 'Sanshin Lo-Fi Vibe', src: '/music/track2.mp3' },
    { title: 'Taipei Night', artist: 'City Pop · Melodic Piano', src: '/music/track3.mp3' },
  ],

  // Spotify tab in the music card. Paste any track/playlist "Embed" URL from Spotify → Share → Embed.
  spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/53SUFMUg0hYjWODKtkbxj3?utm_source=generator&theme=0',
};
