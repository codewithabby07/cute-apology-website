import React, { useState, useEffect, useMemo, useRef, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Default template configuration matching live snapshot from Cutiepage
export const defaultTemplateData = {
  coverLabel: "TO MY",
  coverRecipient: "SAIBUN",
  coverTagline: "I'm so",
  coverHeadline: "so so so",
  coverSubheadline: "SORRY",
  coverDescription: "I know I upset you, and a sorry over text felt too small. So I made you this tiny website instead, to steal at least one smile from you 🤍",
  coverImageUrl: "./assets/intro.gif",
  coverNextLabel: "Come in ✨",
  gameHeading: "One heart is missing, place it 💌",
  letterSmallHeader: "A NOTE",
  letterTitle: "Just For You 🎀",
  letterGreeting: "To my Saibun,",
  letterBody: "I hate it when we fight, and I hate it more when it's my fault. You matter more to me than being right ever will. I'm sorry, truly. 🤍",
  letterSignature: "Yours always, Gugu 🐾",
  letterImageUrl: "./assets/letter.png",
  galleryTitle: "Little Surprises",
  galleryFromLabel: "Your Gugu",
  galleryToLabel: "My Saibun",
  galleryPhotoOneUrl: "./assets/pic1.jpg",
  galleryPhotoOneCaption: "flowers, because you deserve them 🌸",
  galleryPhotoTwoUrl: "./assets/pic2.gif",
  galleryPhotoTwoCaption: "a card straight from my heart 💌",
  galleryPhotoThreeUrl: "./assets/pic3.jpg",
  galleryPhotoThreeCaption: "and this one is just us 🥹",
  gallerySignature: "sealed with love, Gugu 🐾",
  playlistHeading: "Songs That Feel Like Us 🤍",
  songOneTitle: "I Love You",
  songOneUrl: "./assets/music1-v2.mp3",
  songOneCoverUrl: "./assets/cover1.gif",
  songTwoTitle: "Raindance",
  songTwoUrl: "./assets/music2-v2.mp3",
  songTwoCoverUrl: "./assets/cover2.gif",
  songThreeTitle: "Dil Jo Tumhara Hai",
  songThreeUrl: "./assets/music3.mp3",
  songThreeCoverUrl: "./assets/cover3.jpg",
  thankYouTitle: "I Love You",
  thankYouSubtitle: "more than anything 🫂",
  thankYouBody: "If you smiled even once while going through this, it was all worth it. Now come here, I owe you a hug. 🤍",
  thankYouImageUrl: "./assets/thankyou.gif",
  thankYouFooterLine: "made with 🤍, hugs, and a lot of missing you 🎀"
};

export function getNamesFromURL() {
  if (typeof window === "undefined" || !window.location) {
    return { from: "Gugu", to: "Saibun" };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const rawFrom = params.get("from") || params.get("From") || params.get("FROM");
    const rawTo = params.get("to") || params.get("To") || params.get("TO");

    const from = rawFrom && rawFrom.trim() ? rawFrom.trim() : "Gugu";
    const to = rawTo && rawTo.trim() ? rawTo.trim() : "Saibun";

    return { from, to };
  } catch (e) {
    return { from: "Gugu", to: "Saibun" };
  }
}

export function transformConfig(e = defaultTemplateData, customNames) {
  const names = customNames || (typeof window !== "undefined" ? getNamesFromURL() : { from: "Gugu", to: "Saibun" });
  const from = (names.from || "Gugu").trim();
  const to = (names.to || "Saibun").trim();

  const recipientDisplay = to.toUpperCase();
  const greetingDisplay = `To my ${to},`;
  const toLabelDisplay = `My ${to}`;
  const fromLabelDisplay = `Your ${from}`;
  const signatureDisplay = `Yours always, ${from} 🐾`;
  const gallerySigDisplay = `sealed with love, ${from} 🐾`;

  return {
    cover: {
      label: e.coverLabel || "TO MY",
      recipient: recipientDisplay,
      tagline: e.coverTagline || "I'm so",
      headline: e.coverHeadline || "so so so",
      subheadline: e.coverSubheadline || "SORRY",
      description: e.coverDescription || "I know I upset you, and a sorry over text felt too small. So I made you this tiny website instead, to steal at least one smile from you 🤍",
      imageUrl: e.coverImageUrl || "./assets/intro.gif",
      nextLabel: e.coverNextLabel || "Come in ✨"
    },
    game: {
      heading: e.gameHeading || "One heart is missing, place it 💌"
    },
    letter: {
      smallHeader: e.letterSmallHeader || "A NOTE",
      title: e.letterTitle || "Just For You 🎀",
      greeting: greetingDisplay,
      body: e.letterBody || "I hate it when we fight, and I hate it more when it's my fault. You matter more to me than being right ever will. I'm sorry, truly. 🤍",
      signature: signatureDisplay,
      imageUrl: e.letterImageUrl || "./assets/letter.png"
    },
    gallery: {
      title: e.galleryTitle || "Little Surprises",
      fromLabel: fromLabelDisplay,
      toLabel: toLabelDisplay,
      signature: gallerySigDisplay,
      photos: [
        {
          url: e.galleryPhotoOneUrl || "./assets/pic1.jpg",
          caption: e.galleryPhotoOneCaption || "flowers, because you deserve them 🌸"
        },
        {
          url: e.galleryPhotoTwoUrl || "./assets/pic2.gif",
          caption: e.galleryPhotoTwoCaption || "a card straight from my heart 💌"
        },
        {
          url: e.galleryPhotoThreeUrl || "./assets/pic3.jpg",
          caption: e.galleryPhotoThreeCaption || "and this one is just us 🥹"
        }
      ]
    },
    playlist: {
      heading: e.playlistHeading || "Songs That Feel Like Us 🤍",
      songs: [
        {
          title: e.songOneTitle || "I Love You",
          url: e.songOneUrl || "./assets/music1-v2.mp3",
          cover: e.songOneCoverUrl || "./assets/cover1.gif"
        },
        {
          title: e.songTwoTitle || "Raindance",
          url: e.songTwoUrl || "./assets/music2-v2.mp3",
          cover: e.songTwoCoverUrl || "./assets/cover2.gif"
        },
        {
          title: e.songThreeTitle || "Dil Jo Tumhara Hai",
          url: e.songThreeUrl || "./assets/music3.mp3",
          cover: e.songThreeCoverUrl || "./assets/cover3.jpg"
        }
      ]
    },
    thankYou: {
      title: e.thankYouTitle || "I Love You",
      subtitle: e.thankYouSubtitle || "more than anything 🫂",
      body: e.thankYouBody || "If you smiled even once while going through this, it was all worth it. Now come here, I owe you a hug. 🤍",
      imageUrl: e.thankYouImageUrl || "./assets/thankyou.gif",
      footerLine: e.thankYouFooterLine || "made with 🤍, hugs, and a lot of missing you 🎀"
    }
  };
}

const ConfigContext = createContext(transformConfig());

function useConfig() {
  return useContext(ConfigContext);
}

const MusicContext = createContext(null);

function useMusicPlayer() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
}

// Equalizer animation bars
function Equalizer() {
  return (
    <span className="flex items-end gap-[2px] h-3.5 w-4 justify-center">
      {[0, 1, 2].map((idx) => (
        <motion.span
          key={idx}
          className="w-[3px] rounded-full bg-[#d84b5a]"
          animate={{ height: ["30%", "100%", "45%", "85%", "30%"] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.15 * idx, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

// Heart Stamp SVG Component
function HeartStamp({ size = 120, className = "", color = "#c83d52" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Heart Stamp"
    >
      <defs>
        <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feComponentTransfer in="mono" result="grain">
            <feFuncA type="table" tableValues="0 0 0.15 0.45" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>
      </defs>
      <g fill={color} opacity="0.9" filter="url(#grain)">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const cx = 100 + 88 * Math.cos(a);
          const cy = 100 + 88 * Math.sin(a);
          return <circle cx={cx} cy={cy} r="3" key={i} />;
        })}
      </g>
      <circle cx="100" cy="100" r="72" stroke={color} strokeWidth="5" fill="none" opacity="0.95" />
      <circle cx="100" cy="100" r="55" stroke={color} strokeWidth="2.5" fill="none" opacity="0.8" />
      <path
        d="M100 82 C100 68 82 68 82 82 C82 96 100 108 100 108 C100 108 118 96 118 82 C118 68 100 68 100 82 Z"
        fill={color}
        stroke="#9e2b3d"
        strokeWidth="1"
        opacity="0.95"
        filter="url(#grain)"
      />
      <path id="topArc" d="M50 90 A45 45 0 0 1 150 95" fill="none" />
      <text
        fontSize="14"
        textAnchor="middle"
        fill={color}
        style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.2em", fontWeight: 600 }}
      >
        <textPath href="#topArc" startOffset="50%">
          LOVE
        </textPath>
      </text>
      <path id="bottomArc" d="M155 110 A55 50 0 0 1 45 110" fill="none" />
      <text
        fontSize="12"
        textAnchor="middle"
        fill="#b23a4b"
        style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.15em", fontWeight: 500 }}
      >
        <textPath href="#bottomArc" startOffset="50%">
          STAMPED
        </textPath>
      </text>
    </svg>
  );
}

// Flower decoration in Gallery
function FlowerStem() {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-sm"
      animate={{ rotate: [0, -8, 8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M13 2.1c4.6 3.4 5.9 10.2 3.1 14.8-2.1 3.4-6.2 5.1-10.2 4.3-.4-2.4.4-4.8 2.2-6.5C10 13 11.4 12.1 13 11.1" />
      <path d="M13 11.1c-3.1-2.9-4.3-7.5-2.2-10.8" />
      <path d="m14.5 12.5 6 6" />
      <path d="m18 16 2.5 2.5" />
    </motion.svg>
  );
}

// Heart icon decoration in Gallery
function HeartIcon() {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="currentColor"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M12.003 21.352c-.347-.19-8.32-4.88-8.32-11.446 0-3.08 2.498-5.578 5.578-5.578 1.83 0 3.538.88 4.618 2.26a4.954 4.954 0 0 1 4.618-2.26c3.08 0 5.578 2.498 5.578 5.578 0 6.565-7.972 11.255-8.32 11.446a.998.998 0 0 1-1.092 0z" />
    </motion.svg>
  );
}

// Music Provider
function MusicPlayerProvider({ children }) {
  const { playlist } = useConfig();
  const songs = playlist.songs;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const validIndex = Math.min(index, Math.max(songs.length - 1, 0));
  const currentSong = songs[validIndex] ?? songs[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleMeta = () => setDuration(audio.duration || 0);
    const handleEnd = () => setIndex((prev) => (prev + 1) % Math.max(songs.length, 1));

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMeta);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMeta);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [songs.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong?.url) {
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      audio.src = currentSong.url;
      audio.load();
      if (isPlayingRef.current) {
        setIsLoading(true);
        audio
          .play()
          .then(() => setIsLoading(false))
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
            setError("Tap play to listen.");
          });
      }
    }
  }, [validIndex, currentSong?.url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
      setIsLoading(true);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setError(null);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          setError("Tap again to retry.");
        });
    }
  };

  const nextSong = () => {
    setIndex((prev) => (prev + 1) % Math.max(songs.length, 1));
    setIsPlaying(true);
  };

  const prevSong = () => {
    setIndex((prev) => (prev - 1 + Math.max(songs.length, 1)) % Math.max(songs.length, 1));
    setIsPlaying(true);
  };

  const selectSong = (i) => {
    if (i === validIndex) {
      togglePlay();
    } else {
      setIndex(i);
      setIsPlaying(true);
    }
  };

  const seek = (time) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <MusicContext.Provider
      value={{
        songs,
        index: validIndex,
        isPlaying,
        isLoading,
        error,
        currentTime,
        duration,
        togglePlay,
        nextSong,
        prevSong,
        selectSong,
        seek
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicContext.Provider>
  );
}

// Screen 0: Cover Screen
function CoverScreen({ onNext }) {
  const { cover } = useConfig();
  const variants = {
    hidden: { opacity: 0, y: 25 },
    visible: (customDelay) => ({
      opacity: 1,
      y: 0,
      transition: { delay: customDelay, duration: 0.8, ease: "easeOut" }
    })
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center bg-[#FBF5F4] px-4 py-4 sm:py-5 relative overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 px-4 text-center flex-1 w-full">
        {/* Recipient */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="flex flex-col items-center text-center mb-2 sm:mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 sm:w-12 bg-[#EE95BB]/50"></span>
            <h1
              className="tracking-[0.2em] text-gray-700 uppercase font-semibold"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif", fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}
            >
              {cover.label}
            </h1>
            <span className="h-px w-8 sm:w-12 bg-[#EE95BB]/50"></span>
          </div>
          <h2
            className="text-[#EE95BB] uppercase font-black leading-none mt-1"
            style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.3rem, 3.5vw, 2.2rem)", letterSpacing: "0.05em" }}
          >
            {cover.recipient} ✦
          </h2>
        </motion.div>

        {/* Tagline + Badge */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="relative leading-none mb-2 sm:mb-3"
        >
          <h1
            className="text-[#EE95BB] italic font-semibold"
            style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(3rem, 9vw, 6rem)", lineHeight: 1 }}
          >
            {cover.tagline}
          </h1>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#F7D9E6] border border-white/70 px-3 py-[2px] rounded-md rotate-[-8deg] shadow-sm">
            <span
              className="text-[clamp(11px,1.8vw,14px)] font-medium"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif", color: "#4a3038" }}
            >
              {cover.headline}
            </span>
          </div>
        </motion.div>

        {/* Big SORRY */}
        <motion.h2
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={0.6}
          className="text-[#1f1f1f] uppercase font-extrabold"
          style={{ fontFamily: "Montserrat, system-ui, sans-serif", fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 1 }}
        >
          {cover.subheadline}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={0.8}
          className="text-[clamp(12px,1.6vw,15px)] text-gray-600 leading-relaxed max-w-[320px]"
          style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
        >
          {cover.description}
        </motion.p>

        {/* Star */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-[#EE95BB] text-[clamp(18px,2vw,22px)]"
        >
          ✦
        </motion.div>

        {/* Illustration */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={1.2}
          className="w-[48%] sm:w-[32%] max-w-[200px] mt-1"
        >
          {cover.imageUrl && (
            <img
              src={cover.imageUrl}
              alt="Cover illustration"
              className="w-full h-auto object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "https://cdn.cutiepage.in/template-seeds/cute-apology/intro.gif";
              }}
            />
          )}
        </motion.div>

        {/* Next Button */}
        {onNext && (
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-2 sm:mt-3 text-gray-700 font-medium bg-[#F7D9E6] px-7 py-2.5 rounded-full text-sm sm:text-base shadow-md hover:bg-[#F7B5CF] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            {cover.nextLabel}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Screen 1: Tic-Tac-Love Game
function GameScreen({ onBack, onNext }) {
  const { game } = useConfig();
  const [board, setBoard] = useState(["heart", "x", "x", "x", null, "x", "x", "x", "heart"]);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (hasWon && onNext) {
      const timer = setTimeout(() => {
        onNext();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasWon, onNext]);

  const handleTileClick = (index) => {
    if (board[index] || hasWon) return;
    const nextBoard = [...board];
    nextBoard[index] = "heart";
    setBoard(nextBoard);
    if (nextBoard.filter((tile) => tile === "heart").length === 3) {
      setHasWon(true);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FBF5F4] px-4 py-4 sm:px-6 sm:py-5 relative overflow-hidden">
      <motion.h1
        className="text-[#d84b5a] italic font-semibold text-center mt-3 sm:mt-5 mb-3 sm:mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {game.heading}
      </motion.h1>

      <motion.div
        className="bg-white/70 w-full max-w-[700px] flex flex-col items-center justify-center py-6 sm:py-8 rounded-2xl shadow-lg border border-[#eadfd9] backdrop-blur-sm relative"
        style={{ fontFamily: "'Playfair Display', serif" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6">
          {board.map((cell, idx) => (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleTileClick(idx)}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 border-[#eba9b3] hover:border-[#d84b5a] flex items-center justify-center text-[clamp(1.8rem,4vw,3rem)] cursor-pointer select-none bg-[#fffaf8] rounded-xl shadow-sm transition-colors"
            >
              {cell === "heart" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-[#d84b5a]"
                >
                  ❤️
                </motion.div>
              )}
              {cell === "x" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#d84b5a]">
                  ✖
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {hasWon && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full bg-[#f7c2cf] blur-3xl opacity-40"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="relative text-[#d84b5a] italic font-semibold text-center px-4"
              style={{ fontSize: "clamp(1.8rem, 6vw, 4rem)" }}
            >
              ❤️ You won my heart ❤️
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center w-full max-w-[700px] mt-4 mb-2 px-4 relative z-10">
        {onBack ? (
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-700 font-medium bg-[#BFD8F0] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-sm hover:bg-[#9EC1E6] hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            ← Back
          </motion.button>
        ) : (
          <span />
        )}
        {onNext ? (
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-700 font-medium bg-[#F7D9E6] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-sm hover:bg-[#F7B5CF] hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            Next →
          </motion.button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

// Screen 2: Love Letter
function LetterScreen({ onBack, onNext }) {
  const { letter } = useConfig();
  const variants = {
    hidden: { opacity: 0, y: 25 },
    visible: (customDelay) => ({
      opacity: 1,
      y: 0,
      transition: { delay: customDelay, duration: 0.8, ease: "easeOut" }
    })
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center bg-[#FBF5F4] px-4 py-4 sm:px-6 sm:py-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#fff8f8_0%,_#fbe9e9_100%)] opacity-90 pointer-events-none" />
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-2xl min-h-[480px] sm:min-h-[440px] bg-white/85 rounded-2xl shadow-xl border border-[#f1dede] px-6 pt-10 pb-24 sm:px-10 sm:pt-9 sm:pb-14 flex flex-col items-center justify-center text-center backdrop-blur-sm"
        >
          {letter.imageUrl && (
            <motion.div
              initial={{ rotate: 6, opacity: 0 }}
              animate={{ rotate: 6, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-[-30px] right-[-25px] w-[110px] sm:w-[130px] rotate-3 overflow-hidden shadow-md"
            >
              <img
                src={letter.imageUrl}
                alt="Memory"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://cdn.cutiepage.in/template-seeds/cute-apology/letter.png";
                }}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -10, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-[-45px] left-[-25px]"
          >
            <HeartStamp />
          </motion.div>

          <motion.div variants={variants} initial="hidden" animate="visible" custom={0.1} className="mb-6">
            <h1
              className="tracking-[0.2em] text-gray-700 uppercase font-semibold"
              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(0.9rem, 1.5vw, 1rem)" }}
            >
              {letter.smallHeader}
            </h1>
            <h2
              className="text-[#EE95BB] uppercase font-black leading-none mt-[2px]"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.4rem, 2.8vw, 2rem)" }}
            >
              {letter.title}
            </h2>
          </motion.div>

          <motion.div variants={variants} initial="hidden" animate="visible" custom={0.3} className="max-w-md space-y-4">
            <h3
              className="text-[#EE95BB] italic font-semibold"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.2rem, 2vw, 1.5rem)" }}
            >
              {letter.greeting}
            </h3>
            <p
              className="text-[#4b4b4b] text-[clamp(13px,1.3vw,15px)] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {letter.body}
            </p>
            <h4
              className="text-[#1f1f1f] italic font-semibold"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1rem, 2vw, 1.3rem)" }}
            >
              {letter.signature}
            </h4>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center w-full max-w-2xl px-6 mt-6 z-20">
          {onBack ? (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-700 font-medium bg-[#BFD8F0] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-sm hover:bg-[#9EC1E6] hover:shadow-md transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              ← Back
            </motion.button>
          ) : (
            <span />
          )}
          {onNext ? (
            <motion.button
              onClick={onNext}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-700 font-medium bg-[#F7D9E6] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-sm hover:bg-[#F7B5CF] hover:shadow-md transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Next →
            </motion.button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

// Screen 3: Polaroid Gallery
function GalleryScreen({ onBack, onNext }) {
  const { gallery } = useConfig();
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = gallery.photos;
  const count = photos.length;
  const currentPhoto = photos[photoIndex] ?? photos[0];

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center bg-[#FBF5F4] px-2 py-3 sm:px-4 sm:py-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#fff8f8_0%,_#fce4ec_100%)] opacity-90 pointer-events-none" />
      <div className="my-auto w-full flex flex-col items-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-[720px] rounded-2xl border-[2px] border-[#e7d8d2] bg-white/80 shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {/* Header */}
          <div className="px-8 sm:px-10 pt-6 text-[#2c2c2c]">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[clamp(1.8rem,6vw,3.2rem)] leading-none text-[#d84b5a] font-semibold text-center"
            >
              {gallery.title}
            </motion.h1>
            <div className="mt-3 border-t-2 border-b-2 border-[#222]/20" />
            <div
              className="flex justify-between mt-2 text-xs sm:text-sm text-[#444]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <span>
                <span className="font-bold">FROM:</span> {gallery.fromLabel}
              </span>
              <span>
                <span className="font-bold">TO:</span> {gallery.toLabel}
              </span>
            </div>
          </div>

          {/* Photo Frame */}
          <div className="mx-6 sm:mx-8 my-4 border-[2px] border-[#2c2c2c]/30 rounded-xl bg-[#faf4f3] relative overflow-hidden flex flex-col items-center justify-center p-3">
            <div className="relative w-full max-w-[480px] aspect-[4/3] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={photoIndex}
                  src={currentPhoto?.url}
                  alt={`Photo ${photoIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-xl ring-1 ring-[#d84b5a]/30"
                  onError={(e) => {
                    const fallbacks = [
                      "https://cdn.cutiepage.in/template-seeds/cute-apology/pic1.jpg",
                      "https://cdn.cutiepage.in/template-seeds/cute-apology/pic2.gif",
                      "https://cdn.cutiepage.in/template-seeds/cute-apology/pic3.jpg"
                    ];
                    e.currentTarget.src = fallbacks[photoIndex] || fallbacks[0];
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Caption */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                {currentPhoto?.caption && (
                  <motion.p
                    key={photoIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-[clamp(1rem,2vw,1.3rem)] text-[#d84b5a] italic bg-white/80 backdrop-blur-sm px-4 py-0.5 rounded-full shadow-sm"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    {currentPhoto.caption}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Corner SVGs */}
            <div className="absolute left-3 top-3 text-[#e74c5b] opacity-30 pointer-events-none">
              <FlowerStem />
            </div>
            <div className="absolute right-3 bottom-3 text-[#e74c5b] opacity-50 pointer-events-none">
              <HeartIcon />
            </div>

            {/* Photo Navigation Buttons */}
            <button
              type="button"
              onClick={() => setPhotoIndex((prev) => (prev - 1 + count) % count)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#fff5f4]/70 border border-[#d84b5a]/50 rounded-full w-9 h-9 flex items-center justify-center text-lg text-[#d84b5a] hover:bg-[#d84b5a] hover:text-white transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer select-none"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setPhotoIndex((prev) => (prev + 1) % count)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#fff5f4]/70 border border-[#d84b5a]/50 rounded-full w-9 h-9 flex items-center justify-center text-lg text-[#d84b5a] hover:bg-[#d84b5a] hover:text-white transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer select-none"
            >
              ›
            </button>
          </div>

          {/* Footer Card Info */}
          <div className="px-8 sm:px-10 pb-6 pt-3 border-t-[1.5px] border-[#2c2c2c]/20 text-[#2c2c2c]">
            <div className="flex justify-between items-end">
              <div className="text-xs sm:text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                <div>
                  <span className="font-bold">DATE:</span> Now
                </div>
                <div>
                  <span className="font-bold">VALID FOR:</span> Forever
                </div>
              </div>
              <div className="text-right">
                <span
                  className="block text-base sm:text-lg text-[#d84b5a]"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  {gallery.signature}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center w-full max-w-[720px] mt-3 sm:mt-4 px-1">
          {onBack ? (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 font-medium bg-[#BFD8F0] px-5 py-2 rounded-full text-sm shadow-md hover:bg-[#9EC1E6] hover:shadow-lg transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              ← Back
            </motion.button>
          ) : (
            <span />
          )}
          {onNext ? (
            <motion.button
              onClick={onNext}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 font-medium bg-[#F7D9E6] px-5 py-2 rounded-full text-sm shadow-md hover:bg-[#F7B5CF] hover:shadow-lg transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Next →
            </motion.button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

// Screen 4: Dedicated Music Playlist
function PlaylistScreen({ onBack, onNext }) {
  const { playlist } = useConfig();
  const { songs, index, isPlaying, isLoading, error, currentTime, duration, togglePlay, nextSong, prevSong, selectSong, seek } =
    useMusicPlayer();

  const currentSong = songs[index] ?? songs[0];

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center bg-[#FBF5F4] relative overflow-hidden px-3 py-4 sm:px-5 sm:py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#fff8f8_0%,_#fde5eb_100%)] opacity-90 pointer-events-none" />
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-[700px] bg-white/85 rounded-2xl shadow-2xl border border-[#e7d8d2] px-5 py-6 sm:px-8 sm:py-7 flex flex-col items-center text-center backdrop-blur-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[clamp(1.2rem,4vw,2.2rem)] text-[#d84b5a] italic font-bold mb-4"
          >
            {playlist.heading}
          </motion.h1>

          {/* Album Cover Art */}
          <div className="relative flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                transition={{ duration: 0.5 }}
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-xl ring-1 ring-[#d84b5a]/30"
              >
                {currentSong?.cover && (
                  <img
                    src={currentSong.cover}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      const fallbacks = [
                        "https://cdn.cutiepage.in/template-seeds/cute-apology/cover1.gif",
                        "https://cdn.cutiepage.in/template-seeds/cute-apology/cover2.gif",
                        "https://cdn.cutiepage.in/template-seeds/cute-apology/cover3.jpg"
                      ];
                      e.currentTarget.src = fallbacks[index] || fallbacks[0];
                    }}
                  />
                )}
                {isPlaying && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center text-5xl text-white drop-shadow-xl"
                  >
                    ♪
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Title & Status */}
          <div className="mb-4 w-full max-w-sm">
            <p
              className="text-[#d84b5a] uppercase text-[10px] sm:text-xs tracking-widest mb-1 font-semibold"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {isLoading ? "Loading..." : isPlaying ? "♪ Now Playing ♪" : "Paused"}
            </p>
            <h2 className="text-base sm:text-lg font-semibold text-[#2c2c2c]">{currentSong?.title ?? ""}</h2>
            {error && (
              <p
                className="text-[11px] text-[#d84b5a]/80 mt-1"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Audio Scrubber */}
          <div className="w-full max-w-sm mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer appearance-none focus:outline-none"
              style={{
                background: `linear-gradient(to right, #d84b5a 0%, #d84b5a ${progressPercent}%, #f1e5e5 ${progressPercent}%, #f1e5e5 100%)`
              }}
            />
            <div
              className="flex justify-between text-[#8a7a7a] text-[11px] sm:text-xs mt-1.5"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 mb-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevSong}
              disabled={isLoading}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-[#d84b5a] text-[#d84b5a] text-lg sm:text-xl shadow-md hover:bg-[#d84b5a] hover:text-white disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center select-none"
            >
              ⏮
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              disabled={isLoading}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#d84b5a] to-[#c03d4a] text-white text-2xl sm:text-3xl shadow-lg hover:shadow-xl border-2 border-[#a83545] disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center select-none"
            >
              {isLoading ? "⟳" : isPlaying ? "⏸" : "▶"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextSong}
              disabled={isLoading}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-[#d84b5a] text-[#d84b5a] text-lg sm:text-xl shadow-md hover:bg-[#d84b5a] hover:text-white disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center select-none"
            >
              ⏭
            </motion.button>
          </div>

          {/* Playlist Track List */}
          <div className="w-full max-w-sm space-y-1.5">
            {songs.map((song, i) => {
              const isActive = i === index;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectSong(i)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#d84b5a]/10 border-[#d84b5a]/30 shadow-sm"
                      : "bg-white/50 border-transparent hover:bg-white hover:border-[#e7d8d2]"
                  }`}
                >
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#d84b5a]/20"
                      draggable={false}
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-lg bg-[#f7d9e6] flex items-center justify-center text-[#d84b5a]">
                      ♪
                    </span>
                  )}
                  <span
                    className={`flex-1 truncate text-sm ${isActive ? "text-[#d84b5a] font-semibold" : "text-[#4b4b4b]"}`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {song.title}
                  </span>
                  <span
                    className="text-xs text-[#d84b5a] w-4 text-center"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {isActive ? (
                      isPlaying ? (
                        <Equalizer />
                      ) : (
                        "▶"
                      )
                    ) : (
                      <span className="text-[#b9a8a8]">{i + 1}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center w-full max-w-[700px] mt-4 px-1">
          {onBack ? (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
              className="text-gray-700 font-medium bg-[#BFD8F0] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-md hover:bg-[#9EC1E6] hover:shadow-lg transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              ← Back
            </motion.button>
          ) : (
            <span />
          )}
          {onNext ? (
            <motion.button
              onClick={onNext}
              whileTap={{ scale: 0.95 }}
              className="text-gray-700 font-medium bg-[#F7D9E6] px-6 py-2.5 rounded-full text-sm sm:text-base shadow-md hover:bg-[#F7B5CF] hover:shadow-lg transition-all cursor-pointer"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Next →
            </motion.button>
          ) : (
            <span />
          )}
        </div>
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d84b5a;
          border: 2px solid white;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d84b5a;
          border: 2px solid white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// Screen 5: Thank You Screen
function ThankYouScreen({ onBack }) {
  const { thankYou } = useConfig();
  const { songs, index, isPlaying, currentTime, togglePlay } = useMusicPlayer();
  const currentSong = songs[index] ?? songs[0];
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 10 }, (_, i) => ({
        key: i,
        startX: 100 * Math.random(),
        driftX: 100 * Math.random() - 40,
        duration: 8 + 4 * Math.random(),
        delay: 2 * Math.random(),
        size: 18 * Math.random() + 14
      }))
    );
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center bg-[#fdf9f8] px-3 py-4 sm:py-5 overflow-hidden">
      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.key}
            className="absolute text-[#f19ac0] opacity-30 select-none"
            initial={{ y: "100vh", x: `${p.startX}vw` }}
            animate={{
              y: [-100, -300, -500],
              x: `calc(${p.driftX}vw - 40px)`,
              opacity: [0.3, 0.6, 0]
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: `${p.size}px` }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-[760px] flex flex-col items-start z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full bg-white rounded-2xl shadow-xl border border-[#f1e3e0] px-6 sm:px-10 py-6 sm:py-8 flex flex-col justify-between text-center backdrop-blur-sm"
          style={{
            fontFamily: "'Playfair Display', serif",
            backgroundImage: "linear-gradient(180deg, #fffdfc 0%, #fff7f7 100%)"
          }}
        >
          {/* Top Label */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#444] uppercase tracking-wider mb-4">
            <span>for my love ✦</span>
            <span className="font-semibold text-[#EE95BB]"> ✦ </span>
          </div>

          {/* Center Message */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.h1
              className="text-[#EE95BB] text-[clamp(2.8rem,10vw,5.5rem)] italic font-medium leading-none mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {thankYou.title}
            </motion.h1>
            <motion.h2
              className="text-[#2c2c2c] text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold uppercase tracking-tight mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {thankYou.subtitle}
            </motion.h2>
            <motion.p
              className="text-[#4b4b4b] text-[clamp(0.9rem,1.4vw,1.1rem)] leading-relaxed max-w-[480px] whitespace-pre-line"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {thankYou.body}
            </motion.p>
          </div>

          {/* Sticker */}
          {thankYou.imageUrl && (
            <motion.img
              src={thankYou.imageUrl}
              alt="Sticker"
              className="absolute right-1 -bottom-5 sm:right-4 sm:-bottom-8 w-[110px] sm:w-[170px] md:w-[210px] select-none drop-shadow-lg"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onError={(e) => {
                e.currentTarget.src = "https://cdn.cutiepage.in/template-seeds/cute-apology/thankyou.gif";
              }}
            />
          )}

          {/* Footer Line */}
          <div className="text-center text-xs sm:text-sm mt-6 text-[#2c2c2c]">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              {thankYou.footerLine}
            </motion.p>
          </div>
        </motion.div>

        {/* Back Button */}
        {onBack && (
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 text-gray-700 font-medium bg-[#F7D9E6] px-6 py-2 sm:px-7 sm:py-2.5 rounded-full text-sm sm:text-base shadow-md hover:bg-[#F7B5CF] hover:shadow-lg transition-all cursor-pointer"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            ← Back
          </motion.button>
        )}
      </div>

      {/* Floating mini audio pill */}
      {(isPlaying || currentTime > 0) && currentSong && (
        <motion.button
          onClick={togglePlay}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2 bg-white/85 backdrop-blur-sm border border-[#f1dede] rounded-full pl-3 pr-4 py-1.5 shadow-sm text-xs text-[#4b4b4b] hover:shadow-md transition-all cursor-pointer"
          style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
        >
          <span className="text-[#d84b5a]">{isPlaying ? "⏸" : "▶"}</span>
          <span className="max-w-[140px] truncate">{currentSong.title}</span>
        </motion.button>
      )}
    </div>
  );
}

const slideVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

// Flow Controller
function CuteApologyFlow() {
  const [screen, setScreen] = useState(0);

  return (
    <div className="min-h-screen bg-[#FBF5F4] relative flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {screen === 0 && (
          <motion.div
            key="cover"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <CoverScreen onNext={() => setScreen(1)} />
          </motion.div>
        )}
        {screen === 1 && (
          <motion.div
            key="tictac"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <GameScreen onBack={() => setScreen(0)} onNext={() => setScreen(2)} />
          </motion.div>
        )}
        {screen === 2 && (
          <motion.div
            key="letter"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <LetterScreen onBack={() => setScreen(1)} onNext={() => setScreen(3)} />
          </motion.div>
        )}
        {screen === 3 && (
          <motion.div
            key="gallery"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <GalleryScreen onBack={() => setScreen(2)} onNext={() => setScreen(4)} />
          </motion.div>
        )}
        {screen === 4 && (
          <motion.div
            key="playlist"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <PlaylistScreen onBack={() => setScreen(3)} onNext={() => setScreen(5)} />
          </motion.div>
        )}
        {screen === 5 && (
          <motion.div
            key="thankyou"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full pb-10"
          >
            <ThankYouScreen onBack={() => setScreen(4)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Credit */}
      <footer className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
        <div className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-[#f1dede] shadow-sm text-[11px] sm:text-xs text-gray-500 transition-all">
          <span>Created by</span>
          <a
            href="https://codewithabby-portfolio.vercel.app/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#d84b5a] hover:underline"
            style={{ textDecorationColor: "#d84b5a" }}
          >
            CodeWithAbby
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function CuteApologyApp({ config, senderName, receiverName }) {
  const [names, setNames] = useState(() => {
    if (senderName || receiverName) {
      return { from: senderName || "Gugu", to: receiverName || "Saibun" };
    }
    return getNamesFromURL();
  });

  useEffect(() => {
    if (senderName || receiverName) {
      setNames({ from: senderName || "Gugu", to: receiverName || "Saibun" });
      return;
    }
    const handleUrlChange = () => {
      setNames(getNamesFromURL());
    };
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [senderName, receiverName]);

  const mergedConfig = useMemo(() => {
    return transformConfig(config || defaultTemplateData, names);
  }, [config, names]);

  return (
    <div className="cute-apology-root">
      <ConfigContext.Provider value={mergedConfig}>
        <MusicPlayerProvider>
          <CuteApologyFlow />
        </MusicPlayerProvider>
      </ConfigContext.Provider>
    </div>
  );
}
