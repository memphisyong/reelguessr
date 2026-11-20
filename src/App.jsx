import React, { useState, useEffect, useRef } from "react";

const INITIAL_REELS = [
  {
    round: 1,
    code: "Dep9jgqxRXP",
    url: "https://www.instagram.com/reel/Dep9jgqxRXP/?knvt=M3o0cmx6aGYzeDJo",
    videoUrl: "${import.meta.env.BASE_URL}videos/reel1.mp4",
    stats: {
      views: "0",
      comments: "35447",
      saves: "3600387"
    },
    sliderCfg: { min: 500000, max: 600000, step: 1000, defaultGuess: 550000 },
    comments: [
      { id: "c1", rank: 1, username: "levye_vang", text: "Don’t let corporate see this…", likes: 567885 },
      { id: "c2", rank: 2, username: "shanks.rodiii", text: "This why I quit fast food to many sweats", likes: 531104 }
    ]
  },
  {
    round: 2,
    code: "De2UMB6h_EK",
    url: "https://www.instagram.com/reel/De2UMB6h_EK/?dmpr=MXA3ZDB2cTQ5a3llMw==",
    videoUrl: "${import.meta.env.BASE_URL}videos/reel2.mp4",
    stats: {
      views: "0",
      comments: "142431",
      saves: "8690647"
    },
    sliderCfg: { min: 900000, max: 1000000, step: 1000, defaultGuess: 950000 },
    comments: [
      { id: "c1", rank: 1, username: "honey4dasoulxo", text: "they really left their dog 😭", likes: 903034 },
      { id: "c2", rank: 2, username: "im.gulaboo__", text: "That dog has the survival instincts of a balloon😂💀", likes: 593600 }
    ]
  },
  {
    round: 3,
    code: "DYaUzKFqvQM",
    url: "https://www.instagram.com/p/DYaUzKFqvQM/",
    videoUrl: "${import.meta.env.BASE_URL}videos/reel3.mp4",
    stats: {
      views: "4785000",
      comments: "364",
      saves: "398907"
    },
    sliderCfg: { min: 90000, max: 100000, step: 1000, defaultGuess: 95000 },
    comments: [
      { id: "c1", rank: 1, username: "gbaeskii", text: "Darth maul got his shoes from the mall 🎙️", likes: 94316 },
      { id: "c2", rank: 2, username: "xristosdervenis", text: "I love that the viewers sacrifice 100 bucks for the joke", likes: 41805 }
    ]
  },
  {
    round: 4,
    code: "Db80GqpqE-V",
    url: "https://www.instagram.com/reel/Db80GqpqE-V/?gwpx=OXJqOWJ4bW5meDl2",
    videoUrl: "${import.meta.env.BASE_URL}videos/reel4.mp4",
    stats: {
      views: "0",
      comments: "1402",
      saves: "513814"
    },
    sliderCfg: { min: 40000, max: 50000, step: 100, defaultGuess: 45000 },
    comments: [
      { id: "c1", rank: 1, username: "calebslie", text: "1000% doing this as a dad", likes: 48438 },
      { id: "c2", rank: 2, username: "calebjordanwong", text: "The wife is the real hero, who records them all lol", likes: 41045 }
    ]
  },
  {
    round: 5,
    code: "DbTfogeDC29",
    url: "https://www.instagram.com/p/DbTfogeDC29/",
    videoUrl: "${import.meta.env.BASE_URL}videos/reel5.mp4",
    stats: {
      views: "7418000",
      comments: "618",
      saves: "618198"
    },
    sliderCfg: { min: 100000, max: 200000, step: 1000, defaultGuess: 150000 },
    comments: [
      { id: "c1", rank: 1, username: "chi_nye.re", text: "They're tryna get political😂", likes: 185310 },
      { id: "c2", rank: 2, username: "kylemacmillan17", text: "😂 and nobody's talking why goats have a vacation spot 😂", likes: 35723 }
    ]
  }
];

const DISPLAY_ORDERS = [[1, 0], [0, 1], [1, 0], [0, 1], [1, 0]];

export default function ReelGuessrApp() {
  const [reels] = useState(INITIAL_REELS);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [stage, setStage] = useState(1); // 1: watch, 1.5: ready, 2: q1 pick, 2.5: q1 reveal, 3: q2 slider, 3.5: q2 reveal, 4: round end
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [guessLikes, setGuessLikes] = useState(550000);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [isSummary, setIsSummary] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);

  const [q1RevealStep, setQ1RevealStep] = useState(0);
  const [q1CounterVals, setQ1CounterVals] = useState({ c1: 0, c2: 0 });
  const [q2RevealStep, setQ2RevealStep] = useState(0);
  const [q2CounterVal, setQ2CounterVal] = useState(0);

  const videoRef = useRef(null);
  const currentReel = reels[currentRoundIndex] || reels[0];

  function getMagnitudeBounds(actualLikes) {
    const safeLikes = Math.max(0, Number(actualLikes || 0));
    if (safeLikes <= 0) {
      return { min: 0, max: 1000, step: 10, defaultGuess: 500 };
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(safeLikes)));
    const min = Math.floor(safeLikes / magnitude) * magnitude;
    const max = min + magnitude;
    const step = Math.max(1, Math.round(magnitude / 100));
    const defaultGuess = Math.round((min + max) / 2 / step) * step;
    return { min, max, step, defaultGuess };
  }

  const activeSliderCfg = getMagnitudeBounds(currentReel?.comments?.[0]?.likes);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted, currentRoundIndex, stage, gameStarted]);

  useEffect(() => {
    const bounds = getMagnitudeBounds(currentReel?.comments?.[0]?.likes);
    setGuessLikes(bounds.defaultGuess);
  }, [currentRoundIndex, currentReel]);

  useEffect(() => {
    if (gameStarted && stage === 1 && videoRef.current) {
      setIsBuffering(true);
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
  .then(() => {
    setIsPlaying(true);
    setIsBuffering(false);
  })
  .catch(() => {
    setIsPlaying(false);
    setIsBuffering(false);
  });
      }
    }
    if (stage !== 1 && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [gameStarted, currentRoundIndex, stage, currentReel.videoUrl]);

  function fmt(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  function formatShort(numStr) {
    if (!numStr) return "0";
    const n = typeof numStr === "string"
      ? parseInt(numStr.replace(/,/g, "").replace(/ Likes/g, ""), 10)
      : numStr;
    if (isNaN(n)) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
  }

  function getPercentile(score) {
    if (score >= 95000) return "99%";
    if (score >= 85000) return "90%";
    if (score >= 70000) return "75%";
    if (score >= 50000) return "50%";
    if (score >= 30000) return "25%";
    return "10%";
  }

  function getRoundDifficulty(l1, l2) {
    const ratio = l1 > 0 ? l2 / l1 : 0;
    if (ratio >= 0.75) return { label: "🔥 Hard", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
    if (ratio >= 0.45) return { label: "⚡ Medium", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
    return { label: "🎯 Easy", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  }

  function calcPart1Score(pickedLikes, topLikes) {
    if (!topLikes || topLikes <= 0) return 0;
    if (pickedLikes >= topLikes) return 10000;
    return Math.round(10000 * (pickedLikes / topLikes));
  }

  function calcPart2Score(guessedLikes, actualTopLikes) {
    if (!actualTopLikes || actualTopLikes <= 0) return 0;
    const error = Math.abs(guessedLikes - actualTopLikes) / actualTopLikes;
    if (error <= 0.01) return 10000;
    if (error <= 0.20) return Math.round(10000 * (1 - (error - 0.01) / 0.19));
    const decayError = Math.min(1.0, error);
    return Math.max(0, Math.round(10000 * (1 - Math.pow(decayError, 0.6))));
  }

  function getAccuracyPercent(guessedLikes, actualTopLikes) {
    if (!actualTopLikes || actualTopLikes <= 0) return 0;
    const error = Math.abs(guessedLikes - actualTopLikes) / actualTopLikes;
    if (error <= 0.01) return 100;
    if (error <= 0.20) return 100 * (1 - (error - 0.01) / 0.19);
    return Math.max(0, 100 * (1 - Math.pow(Math.min(1.0, error), 0.6)));
  }

  function getDynamicColor(percent) {
    const hue = Math.floor((percent / 100) * 140);
    return `hsla(${hue}, 85%, 45%, 0.95)`;
  }

  function getEstimateRating(guessedLikes, actualTopLikes) {
    const error = Math.abs(guessedLikes - actualTopLikes) / actualTopLikes;
    if (error <= 0.01) return { badge: "💎 Perfect Estimate! (10,000 pts)" };
    if (error <= 0.05) return { badge: "🔥 Sharp Estimate!" };
    if (error <= 1.0) return { badge: "👍 Solid Ballpark" };
    return { badge: "📈 Wide of the Mark" };
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(Number(e.target.value));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (stage === 1 && !selectedCommentId) setStage(1.5);
  };

  const handleSelectComment = (comment) => {
    setSelectedCommentId(comment.id);
    setStage(2.5);
    setQ1RevealStep(1);

    const c1Target = currentReel.comments[0].likes;
    const c2Target = currentReel.comments[1].likes;
    const speedMs = 100;
    let step = 0;

    const jump = () => {
      step++;
      if (step === 1) {
        setQ1CounterVals({
          c1: Math.floor(c1Target * (Math.random() * 0.2 + 0.1)),
          c2: Math.floor(c2Target * (Math.random() * 0.2 + 0.1))
        });
        setTimeout(jump, speedMs);
      } else if (step === 2) {
        setQ1CounterVals({
          c1: Math.floor(c1Target * (Math.random() * 0.3 + 0.3)),
          c2: Math.floor(c2Target * (Math.random() * 0.3 + 0.3))
        });
        setTimeout(jump, speedMs);
      } else if (step === 3) {
        setQ1CounterVals({
          c1: Math.floor(c1Target * (Math.random() * 0.2 + 0.7)),
          c2: Math.floor(c2Target * (Math.random() * 0.2 + 0.7))
        });
        setTimeout(jump, speedMs);
      } else {
        setQ1CounterVals({ c1: c1Target, c2: c2Target });
        setTimeout(() => {
          setQ1RevealStep(2);
          setTimeout(() => {
            setQ1RevealStep(3);
          }, 700);
        }, 100);
      }
    };
    jump();
  };

  const handleContinueToQ2 = () => {
    setStage(3);
    setQ2RevealStep(0);
  };

  const handleLockInEstimate = () => {
    setStage(3.5);
    setQ2RevealStep(1);

    const actualVal = currentReel.comments[0].likes;
    const speedMs = 100;
    let step = 0;

    const jump = () => {
      step++;
      if (step === 1) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.2 + 0.1)));
        setTimeout(jump, speedMs);
      } else if (step === 2) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.3 + 0.3)));
        setTimeout(jump, speedMs);
      } else if (step === 3) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.2 + 0.7)));
        setTimeout(jump, speedMs);
      } else {
        setQ2CounterVal(actualVal);
        setQ2RevealStep(2);

        setTimeout(() => {
          setQ2RevealStep(3);

          setTimeout(() => {
            const topComment = currentReel.comments[0];
            const pickedComment = currentReel.comments.find((c) => c.id === selectedCommentId);

            const part1 = calcPart1Score(pickedComment.likes, topComment.likes);
            const part2 = calcPart2Score(guessLikes, topComment.likes);
            const total = part1 + part2;

            const newResult = {
              round: currentReel.round,
              url: currentReel.url,
              pickedRank: pickedComment.rank,
              difficulty: getRoundDifficulty(currentReel.comments[0].likes, currentReel.comments[1].likes),
              estimateRating: getEstimateRating(guessLikes, topComment.likes),
              part1Score: part1,
              guessedLikes: guessLikes,
              actualTopLikes: topComment.likes,
              part2Score: part2,
              totalScore: total
            };

            const updated = [...results];
            updated[currentRoundIndex] = newResult;
            setResults(updated);
            setStage(4);
          }, 1500);
        }, 1000);
      }
    };
    jump();
  };

  const handleNextRoundOrSummary = () => {
    if (currentRoundIndex < reels.length - 1) {
      setCurrentRoundIndex(currentRoundIndex + 1);
      setSelectedCommentId(null);
      setQ1RevealStep(0);
      setQ2RevealStep(0);
      setStage(1);
    } else {
      const grandTotal = results.reduce((acc, r) => acc + (r ? r.totalScore : 0), 0);
      setIsSummary(true);
      startScoreAnimation(grandTotal);
    }
  };

  const startScoreAnimation = (grandTotal) => {
    let current = 0;
    const step = Math.max(1, Math.ceil(grandTotal / 50));
    const timer = setInterval(() => {
      current += step;
      if (current >= grandTotal) {
        current = grandTotal;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 16);
  };

  const restartTest = () => {
    setIsSummary(false);
    setCurrentRoundIndex(0);
    setSelectedCommentId(null);
    setResults([]);
    setQ1RevealStep(0);
    setQ2RevealStep(0);
    setStage(1);
    setGameStarted(true);
  };

  const goHome = () => {
    setIsSummary(false);
    setGameStarted(false);
    setCurrentRoundIndex(0);
    setSelectedCommentId(null);
    setResults([]);
    setQ1RevealStep(0);
    setQ2RevealStep(0);
    setStage(1);
  };

  const grandTotalScore = results.reduce((acc, r) => acc + (r ? r.totalScore : 0), 0);
  const diffInfo = getRoundDifficulty(currentReel.comments[0].likes, currentReel.comments[1].likes);

  const renderCommentCard = ({ username, text, onClick, isInteractive = false, badgeText = null }) => {
    const Wrapper = isInteractive ? "button" : "div";
    return (
      <Wrapper
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl bg-[#1f2937] border border-gray-700/80 flex items-start gap-3.5 shadow-lg transition ${
          isInteractive ? "hover:border-pink-500 hover:bg-[#263244] active:scale-[0.99] cursor-pointer group" : ""
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5 flex-shrink-0 mt-0.5 shadow-md">
          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-300 truncate">@{username}</p>
            {badgeText && (
              <span className="text-xs font-semibold text-gray-400 group-hover:text-pink-400 transition">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-base mt-1 text-white leading-snug break-words font-normal">{text}</p>
        </div>
      </Wrapper>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] selection:bg-pink-500 selection:text-white font-sans">
      <style>{`
        @keyframes dropIn { 0% { opacity: 0; transform: translateY(-20px) scale(1.5); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-drop-in { animation: dropIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes floatUpFade { 0% { opacity: 0; transform: translateY(15px) scale(0.9); } 15% { opacity: 1; transform: translateY(-5px) scale(1.1); } 80% { opacity: 1; transform: translateY(-25px) scale(1); } 100% { opacity: 0; transform: translateY(-35px) scale(0.9); } }
        .animate-float-score { animation: floatUpFade 1.6s ease-out forwards; }
        @keyframes slideInLeft { 0% { opacity: 0; transform: translateX(-30px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-fade { animation: slideUpFade 0.4s ease-out forwards; }
      `}</style>

      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={goHome}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center font-extrabold text-white shadow-md">
              RG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">ReelGuessr</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  Daily 5-Set
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={restartTest}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition"
            >
              🔄 Restart
            </button>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
              <span className="text-xs text-zinc-400">Score:</span>
              <span className="font-mono font-bold text-sm text-white">{fmt(grandTotalScore)}</span>
              <span className="text-[11px] text-zinc-500 font-mono">/ 100K</span>
            </div>
          </div>
        </div>
      </header>

      {!gameStarted ? (
        <main className="flex-1 max-w-lg mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6">
            RG
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Today&apos;s 5-Reel Challenge</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Spot the #1 most-liked comment and estimate its like count for a maximum of <strong>100,000 points</strong>.
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-extrabold text-base shadow-xl hover:opacity-95 transition active:scale-95"
          >
            Start Daily Set (5 Reels) →
          </button>
        </main>
      ) : !isSummary ? (
        <>
          <div className="bg-zinc-900/60 border-b border-zinc-800/60 z-30 relative">
            <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                {reels.map((r, idx) => {
                  const done = results[idx];
                  const isCurrent = idx === currentRoundIndex;
                  return (
                    <div
                      key={r.round}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border shrink-0 ${
                        done
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : isCurrent
                          ? "bg-pink-500/20 border-pink-500/50 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      }`}
                    >
                      <span>Reel {r.round}</span>
                      {done && <span className="font-mono text-[11px] text-emerald-400">{fmt(done.totalScore)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between z-30 relative">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Round {currentReel.round} of 5
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-3 py-0.5 rounded-full border ${diffInfo.color}`}>
                  {diffInfo.label}
                </span>
              </div>

              <div className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden pt-4 pb-4" style={{ minHeight: "680px" }}>
                <div className="relative w-[350px] max-w-full h-[620px] rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 flex flex-col group/player">
                  <video
                    key={currentReel.videoUrl}
                    ref={videoRef}
                    src={currentReel.videoUrl}
                    muted={muted}
                    onClick={() => {
                      if (!isBuffering) togglePlayPause();
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onLoadStart={() => setIsBuffering(true)}
                    onCanPlay={() => setIsBuffering(false)}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    className="w-full h-full object-cover cursor-pointer"
                    playsInline
                    autoPlay
                  />

                  {isBuffering && stage === 1 && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
                    </div>
                  )}

                  {!isPlaying && !isBuffering && stage === 1 && (
                    <button
                      onClick={togglePlayPause}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition z-10"
                    >
                      <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}

                  {stage === 1 && (
                    <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-6">
                      <div className="flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <svg className="w-7 h-7 text-white fill-transparent stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[13px] font-semibold text-white tracking-tight">
                          {formatShort(currentReel.stats.views)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <svg className="w-7 h-7 text-white fill-transparent stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                        </svg>
                        <span className="text-[13px] font-semibold text-white tracking-tight">
                          {formatShort(currentReel.stats.comments)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <svg className="w-7 h-7 text-white fill-transparent stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span className="text-[13px] font-semibold text-white tracking-tight">
                          {formatShort(currentReel.stats.saves)}
                        </span>
                      </div>
                    </div>
                  )}

                  {stage === 1 && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-3 px-3 z-20 flex flex-col justify-end">
                      <div className="absolute left-3 bottom-6 flex flex-col items-center gap-1 group z-30">
                        <div className="w-8 h-20 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full backdrop-blur-md relative mb-1 overflow-hidden shadow-lg border border-white/10">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={muted ? 0 : Math.round(volume * 100)}
                            onChange={(e) => {
                              setVolume(Number(e.target.value) / 100);
                              setMuted(false);
                            }}
                            className="w-16 h-1.5 accent-white bg-white/20 rounded-full cursor-pointer absolute transform -rotate-90 appearance-none"
                          />
                        </div>
                        <button onClick={() => setMuted(!muted)} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] p-1 hover:scale-110 transition">
                          {muted || volume === 0 ? (
                            <svg className="w-6 h-6 stroke-white fill-transparent stroke-[1.8]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 stroke-white fill-transparent stroke-[1.8]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={handleSeek}
                        className="w-full accent-white h-[3px] bg-white/30 rounded-lg cursor-pointer hover:h-1.5 transition-all mt-auto"
                      />
                    </div>
                  )}
                </div>

                {stage === 1.5 && (
                  <div className="absolute inset-0 z-40 bg-zinc-950/85 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center text-2xl mb-4 shadow-lg">
                      🎬
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to guess?</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mt-6">
                      <button
                        onClick={() => {
                          videoRef.current.currentTime = 0;
                          setStage(1);
                        }}
                        className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-sm border border-zinc-700 transition"
                      >
                        ↺ Rewatch Reel
                      </button>
                      <button
                        onClick={() => setStage(2)}
                        className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-bold text-sm shadow-lg hover:opacity-95 transition"
                      >
                        Start Guessing →
                      </button>
                    </div>
                  </div>
                )}

                {stage === 2 && (
                  <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setStage(1)}
                        className="text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 px-3.5 py-1.5 rounded-full hover:bg-zinc-800"
                      >
                        ← Rewatch Reel
                      </button>
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Question 1 of 2</span>
                    </div>
                    <div className="my-auto py-4 max-w-xl mx-auto w-full">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Which comment got the most likes?</h2>
                        <p className="text-sm text-zinc-400 mt-1">Tap the comment you think ranked #1 (Worth up to 10,000 pts)</p>
                      </div>
                      <div className="flex flex-col gap-4">
                        {DISPLAY_ORDERS[currentRoundIndex % DISPLAY_ORDERS.length].map((cIdx, dispIdx) => {
                          const c = currentReel.comments[cIdx];
                          return (
                            <div key={c.id}>
                              {renderCommentCard({
                                username: c.username,
                                text: c.text,
                                isInteractive: true,
                                badgeText: `Option ${dispIdx === 0 ? "A" : "B"} • Select →`,
                                onClick: () => handleSelectComment(c)
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {stage === 2.5 && (() => {
                  const picked = currentReel.comments.find((c) => c.id === selectedCommentId);
                  const isCorrect = picked?.rank === 1;
                  const topComment = currentReel.comments[0];
                  const runnerUp = currentReel.comments[1];
                  const earnedPts = calcPart1Score(picked.likes, topComment.likes);

                  const totalEngagement = topComment.likes + runnerUp.likes;
                  const winnerShare = totalEngagement > 0 ? Math.round((topComment.likes / totalEngagement) * 100) : 50;
                  const runnerUpShare = 100 - winnerShare;

                  return (
                    <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Question 1 Results</span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {isCorrect ? "🎉 Spot On!" : "😬 Close Call"}
                        </span>
                      </div>

                      <div className="my-auto py-4 max-w-xl mx-auto w-full flex flex-col gap-4">
                        {currentReel.comments.map((c) => {
                          const isPicked = c.id === selectedCommentId;
                          const isTop = c.rank === 1;

                          let borderClass = "border-zinc-700";
                          let fillClass = "";
                          if (q1RevealStep >= 2) {
                            if (isPicked && isCorrect) {
                              borderClass = "border-emerald-500 ring-2 ring-emerald-500/50";
                              fillClass = "bg-[#10b981]";
                            } else if (isPicked && !isCorrect) {
                              borderClass = "border-rose-500 ring-2 ring-rose-500/50";
                              fillClass = "bg-[#e11d48]";
                            } else {
                              borderClass = "border-zinc-700";
                              fillClass = "bg-[#27272a]";
                            }
                          }

                          return (
                            <div
                              key={c.id}
                              className={`relative w-full rounded-2xl border bg-[#1f2937] overflow-hidden shadow-lg transition-all duration-400 ${borderClass}`}
                            >
                              <div className="p-4 flex gap-3.5 opacity-40 blur-[2px]">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5 flex-shrink-0">
                                  <div className="w-full h-full bg-gray-900 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-300 truncate">@{c.username}</p>
                                  <p className="text-base mt-1 text-white leading-snug break-words">{c.text}</p>
                                </div>
                              </div>

                              <div
                                className={`absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-400 ${
                                  q1RevealStep >= 2 ? fillClass : "bg-zinc-900/70"
                                }`}
                              >
                                <span
                                  className={`font-mono font-black transition-all duration-300 ${
                                    isPicked && isCorrect
                                      ? "text-4xl text-emerald-400"
                                      : isPicked && !isCorrect
                                      ? "text-3xl text-rose-400"
                                      : "text-2xl font-bold text-zinc-300"
                                  } ${
                                    q1RevealStep >= 2
                                      ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] scale-105"
                                      : ""
                                  } ${isPicked && q1RevealStep >= 3 ? "opacity-0 scale-90" : ""}`}
                                >
                                  {fmt(c.rank === 1 ? q1CounterVals.c1 : q1CounterVals.c2)}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors duration-300 ${
                                    q1RevealStep >= 2
                                      ? "text-white/90"
                                      : isPicked && isCorrect
                                      ? "text-emerald-500/80"
                                      : isPicked && !isCorrect
                                      ? "text-rose-500/80"
                                      : "text-zinc-500"
                                  } ${isPicked && q1RevealStep >= 3 ? "opacity-0" : ""}`}
                                >
                                  {isPicked && isCorrect
                                    ? "Correct!"
                                    : isPicked && !isCorrect
                                    ? "Incorrect"
                                    : isTop
                                    ? "Actual #1"
                                    : "Likes"}
                                </span>

                                {isPicked && q1RevealStep >= 3 && (
                                  <div className="absolute z-10 text-white font-black text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-float-score">
                                    +{fmt(earnedPts)} PTS
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        <div className="mt-1 bg-[#1e2532] border border-gray-700/60 rounded-2xl p-4 shadow-lg">
                          <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#10b981]">
                              Winner Share &middot; {winnerShare}%
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">
                              {runnerUpShare}% &middot; Runner-Up Share
                            </span>
                          </div>
                          <div className="h-3.5 w-full bg-[#1e2532] rounded-full flex items-stretch gap-0.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#059669] to-[#10b981]"
                              style={{ width: `${winnerShare}%` }}
                            />
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-rose-600"
                              style={{ width: `${runnerUpShare}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleContinueToQ2}
                          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold text-base shadow-lg transition active:scale-95"
                        >
                          Continue to Question 2 →
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {stage === 3 && (() => {
                  const picked = currentReel.comments.find((c) => c.id === selectedCommentId);
                  const isCorrect = picked?.rank === 1;
                  const topComment = currentReel.comments[0];
                  return (
                    <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setStage(1)}
                          className="text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 px-3.5 py-1.5 rounded-full hover:bg-zinc-800"
                        >
                          👁️ Peek at Reel
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Question 2 of 2</span>
                      </div>
                      <div className="my-auto py-4 max-w-xl mx-auto w-full flex flex-col gap-5">
                        <div
                          className={`p-3.5 rounded-2xl border text-center ${
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          <div className="text-sm sm:text-base font-extrabold">
                            {isCorrect
                              ? "🎉 Spot on! You found the #1 Comment! (+10,000 pts)"
                              : "😬 Close! You picked the runner-up comment."}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                            🏆 Actual #1 Most-Liked Comment
                          </div>
                          {renderCommentCard({ username: topComment.username, text: topComment.text, isInteractive: false })}
                        </div>
                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 text-center shadow-lg">
                          <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            How many likes did it get?
                          </p>
                          <p className="text-4xl font-black text-pink-500 mb-5">{fmt(guessLikes)}</p>
                          <input
                            type="range"
                            min={activeSliderCfg.min}
                            max={activeSliderCfg.max}
                            step={activeSliderCfg.step}
                            value={guessLikes}
                            onChange={(e) => setGuessLikes(Number(e.target.value))}
                            className="w-full accent-pink-500 h-2 bg-gray-700 rounded-lg cursor-pointer mb-2"
                          />
                          <div className="flex justify-between text-xs text-gray-400 font-semibold px-1">
                            <span>{fmt(activeSliderCfg.min)}</span>
                            <span>{fmt(activeSliderCfg.max)}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleLockInEstimate}
                          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-4 rounded-2xl shadow-lg transform transition active:scale-95 text-lg"
                        >
                          Lock In Guess
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {stage === 3.5 && (() => {
                  const topComment = currentReel.comments[0];
                  const actualVal = topComment.likes;
                  const minVal = activeSliderCfg.min;
                  const maxVal = activeSliderCfg.max;
                  const span = Math.max(1, maxVal - minVal);

                  const guessPercent = Math.min(100, Math.max(0, ((guessLikes - minVal) / span) * 100));
                  const actualPercent = Math.min(100, Math.max(0, ((actualVal - minVal) / span) * 100));

                  const accPct = getAccuracyPercent(guessLikes, actualVal);
                  const pts = calcPart2Score(guessLikes, actualVal);
                  const fillBg = getDynamicColor(accPct);

                  return (
                    <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Question 2 Reveal</span>
                        <span className="text-xs font-semibold text-zinc-400">Calculating Score...</span>
                      </div>

                      <div className="my-auto py-4 max-w-md mx-auto w-full flex flex-col gap-5">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 text-center">
                            🏆 Actual #1 Most-Liked Comment
                          </div>
                          {renderCommentCard({ username: topComment.username, text: topComment.text, isInteractive: false })}
                        </div>

                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl relative shadow-lg overflow-hidden min-h-[180px]">
                          <div
                            className={`p-6 flex flex-col transition-opacity duration-300 ${
                              q2RevealStep >= 3 ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            <div className="flex justify-between items-end mb-4 px-2">
                              <div className="text-left">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Your Guess</p>
                                <p className="text-2xl font-black text-pink-500">{fmt(guessLikes)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Actual Likes</p>
                                <p className="text-3xl font-black text-white font-mono">{fmt(q2CounterVal)}</p>
                              </div>
                            </div>

                            <div className="relative h-6 w-full mb-1">
                              <div className="absolute h-[6px] bg-white w-full rounded-full top-[9px] left-0 z-0"></div>
                              <div
                                className="absolute h-[6px] bg-pink-500/30 rounded-full top-[9px] left-0 z-0"
                                style={{ width: `${guessPercent}%` }}
                              ></div>
                              <div
                                className="absolute top-[3px] w-3 h-3 rounded-full bg-pink-500 z-10 transform -translate-x-1/2"
                                style={{ left: `${guessPercent}%` }}
                              ></div>
                              {q2RevealStep >= 2 && (
                                <div
                                  className="absolute top-[-2px] w-5 h-5 rounded-full bg-white z-20 border-2 border-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-drop-in transform -translate-x-1/2"
                                  style={{ left: `${actualPercent}%` }}
                                ></div>
                              )}
                            </div>

                            <div className="flex justify-between w-full text-xs text-gray-400 font-semibold px-1 mt-2">
                              <span>{fmt(minVal)}</span>
                              <span>{fmt(maxVal)}</span>
                            </div>
                          </div>

                          <div
                            style={{ backgroundColor: q2RevealStep >= 3 ? fillBg : "transparent" }}
                            className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500 ${
                              q2RevealStep >= 3 ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                          >
                            {q2RevealStep >= 3 && (
                              <div className="text-white font-black text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-float-score">
                                +{fmt(pts)} PTS
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {stage === 4 && results[currentRoundIndex] && (() => {
                  const res = results[currentRoundIndex];
                  const picked = currentReel.comments.find((c) => c.id === selectedCommentId);
                  const topComment = currentReel.comments[0];
                  const isLast = currentRoundIndex === reels.length - 1;
                  const pctOff = ((Math.abs(res.actualTopLikes - res.guessedLikes) / res.actualTopLikes) * 100).toFixed(1);

                  return (
                    <div className="absolute inset-0 z-40 bg-[#0f141e] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                          Round {currentReel.round} of 5 Results
                        </span>
                        <span className="font-mono text-sm font-bold text-zinc-300">
                          Round Total: <strong className="text-white">{fmt(res.totalScore)}</strong> / 20,000
                        </span>
                      </div>

                      <div className="my-auto py-4 max-w-md mx-auto w-full flex flex-col gap-3.5">
                        <div
                          style={{ animationDelay: "0.1s" }}
                          className="bg-[#1e2532] border border-[#2a3441] rounded-2xl p-4 opacity-0 animate-slide-in-left"
                        >
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#10b981] mb-2">
                            🏆 ACTUAL #1 MOST-LIKED COMMENT
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-0.5 flex-shrink-0">
                              <div className="w-full h-full bg-[#1e2532] rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 fill-[#a0aec0]" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">@{topComment.username}</p>
                              <p className="text-sm text-gray-200 leading-snug break-words">{topComment.text}</p>
                              <p className="text-xs font-bold text-[#bc1888] mt-1">{fmt(topComment.likes)} Likes</p>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{ animationDelay: "0.4s" }}
                          className="bg-[#1e2532] border border-[#2a3441] rounded-2xl p-4 opacity-0 animate-slide-in-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[15px] font-semibold text-white">Q1: Comment Ranking</span>
                            <span className="text-[22px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
                              +{fmt(res.part1Score)}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold uppercase text-[#718096] mt-1.5">
                            {picked?.rank === 1 ? (
                              <span>
                                🎉 <span className="text-[#10b981]">Spot on! You found the #1 Comment!</span>
                              </span>
                            ) : (
                              <span>≈ Picked #2 Runner-Up</span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{ animationDelay: "0.7s" }}
                          className="bg-[#1e2532] border border-[#2a3441] rounded-2xl p-4 opacity-0 animate-slide-in-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[15px] font-semibold text-white">Q2: Like Count Estimate</span>
                            <span className="text-[22px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
                              +{fmt(res.part2Score)}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold uppercase text-[#718096] mt-1.5">
                            {res.part2Score === 10000 ? (
                              <span>
                                🎯 <span className="text-[#10b981]">Perfect Guess!</span>
                              </span>
                            ) : (
                              <>
                                YOUR GUESS OF {fmt(res.guessedLikes)} WAS{" "}
                                <span className="text-[#10b981]">
                                  {Number(pctOff) < 10 ? `ONLY ${pctOff}% OFF` : `${pctOff}% OFF`}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          style={{ animationDelay: "1.0s" }}
                          className="bg-[#1a202c] border border-[#2d3748] rounded-2xl px-4 py-5 flex justify-between items-center opacity-0 animate-slide-in-left"
                        >
                          <span className="text-lg font-extrabold uppercase tracking-wider text-white">Round Total</span>
                          <span className="text-[28px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
                            {fmt(res.totalScore)}
                          </span>
                        </div>

                        <button
                          onClick={handleNextRoundOrSummary}
                          style={{ animationDelay: "1.5s" }}
                          className="w-full mt-2 bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-2xl shadow-lg transform transition active:scale-95 text-base opacity-0 animate-slide-up-fade"
                        >
                          {isLast ? "Finish Game →" : "Next Round →"}
                        </button>
                      </div>

                      <div className="text-center text-xs text-gray-500">{res.estimateRating.badge}</div>
                    </div>
                  );
                })()}
              </div>

              {stage === 1 && (
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 z-30 relative">
                  <div className="text-xs sm:text-sm text-zinc-400">Ready to lock in your answers?</div>
                  <button
                    onClick={() => setStage(selectedCommentId ? 3 : 2)}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
                  >
                    Guess Now →
                  </button>
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <section className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 mb-3">
                {grandTotalScore >= 80000 ? "👑 Certified Doomscroll Grandmaster" : "🎯 Comment Section Connoisseur"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Your Final Score</h2>
              <div className="mt-3 font-mono text-6xl sm:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]">
                {fmt(animatedScore)}
              </div>
              <p className="text-xs text-zinc-500 mt-2 font-mono">out of 100,000 max points</p>

              {animatedScore === grandTotalScore && grandTotalScore > 0 && (
                <div className="mt-6 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex flex-col items-center">
                  <p className="text-sm text-zinc-400 font-medium">You scored higher than</p>
                  <p className="text-4xl font-black text-emerald-400 mt-1">{getPercentile(grandTotalScore)}</p>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">of players today</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={goHome}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition"
              >
                🏠 Return to Home
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}