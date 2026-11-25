import React, { useState, useEffect, useRef, useCallback } from "react";

const INITIAL_REELS = [
  {
    round: 1,
    code: "Dep9jgqxRXP",
    url: "https://www.instagram.com/reel/Dep9jgqxRXP/?knvt=M3o0cmx6aGYzeDJo",
    videoUrl: `${import.meta.env.BASE_URL}videos/reel1.mp4`,
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
    videoUrl: `${import.meta.env.BASE_URL}videos/reel2.mp4`,
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
    videoUrl: `${import.meta.env.BASE_URL}videos/reel3.mp4`,
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
    videoUrl: `${import.meta.env.BASE_URL}videos/reel4.mp4`,
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
    videoUrl: `${import.meta.env.BASE_URL}videos/reel5.mp4`,
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

/**
 * Locked-in Q1 animation beat timings (ms).
 */
const MERGE_DURATION_MS = 350;
const LEAD_IN_MS = 1500;
const VERDICT_MS = 1200;
const SCORE_MS = 2000;
const DIFF_LEAD_IN_MS = 1200;
const MULTIPLIER_MS = 1200;
const CALLOUT_MS = 800;
const TEXT_SWAP_GAP_MS = 180;

/**
 * Default audio levels (Glassy Tactile Pop theme).
 */
const DEFAULT_BGM_VOLUME = 0.05; // 5%
const DEFAULT_SFX_VOLUME = 0.25; // 25%

/**
 * Neutral dark lead-in pill styling matching ReelGuessr comment cards.
 */
const NEUTRAL_LEAD_IN_STYLE = {
  hex: "#1f2937",
  backgroundColor: "#1f2937",
  borderColor: "rgba(55, 65, 81, 0.8)",
  boxShadow: "0 16px 36px -14px rgba(0, 0, 0, 0.65)"
};

/**
 * Flat Matte Instagram Gradient difficulty palette.
 */
const DIFFICULTY_STYLES = {
  easy: {
    key: "easy",
    label: "Easy",
    hex: "#e3b341",
    pillBg: "#e3b341",
    pillBorder: "rgba(240, 201, 102, 0.60)",
    pillShadow: "0 18px 44px -12px rgba(227, 179, 65, 0.44)",
    textColor: "#18181b",
    eyebrowColor: "rgba(24, 24, 27, 0.80)",
    heartColor: "#18181b",
    badgeBg: "rgba(227, 179, 65, 0.16)",
    badgeBorder: "rgba(240, 201, 102, 0.45)",
    badgeText: "#f0c966"
  },
  medium: {
    key: "medium",
    label: "Medium",
    hex: "#df6f35",
    pillBg: "#df6f35",
    pillBorder: "rgba(242, 144, 92, 0.55)",
    pillShadow: "0 18px 44px -12px rgba(223, 111, 53, 0.45)",
    textColor: "#ffffff",
    eyebrowColor: "rgba(255, 255, 255, 0.90)",
    heartColor: "#ffffff",
    badgeBg: "rgba(223, 111, 53, 0.16)",
    badgeBorder: "rgba(242, 144, 92, 0.45)",
    badgeText: "#f2905c"
  },
  hard: {
    key: "hard",
    label: "Hard",
    hex: "#d13677",
    pillBg: "#d13677",
    pillBorder: "rgba(232, 93, 151, 0.55)",
    pillShadow: "0 18px 44px -12px rgba(209, 54, 119, 0.46)",
    textColor: "#ffffff",
    eyebrowColor: "rgba(255, 255, 255, 0.90)",
    heartColor: "#ffffff",
    badgeBg: "rgba(209, 54, 119, 0.16)",
    badgeBorder: "rgba(232, 93, 151, 0.45)",
    badgeText: "#e85d97"
  }
};

/**
 * Randomized Callout Word pools separated by difficulty tier and outcome.
 */
const CALLOUT_POOLS = {
  easy: {
    correct: ["Nice!", "Great!", "Easy Work!", "Clean Sweep!"],
    incorrect: ["Ouch!", "Fumbled It!", "Bold Call!"]
  },
  medium: {
    correct: ["Ooft!", "Beast!", "Locked In!", "Sharp Read!"],
    incorrect: ["So Close!", "Tough Break!", "Almost Had It!"]
  },
  hard: {
    correct: ["Cracked!", "Elite Ball Knowledge!", "Mind Reader!", "Unreal Read!"],
    incorrect: ["Coin Flip!", "Robbed!", "Brutal Split!"]
  }
};

/**
 * Warm lo-fi chord progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7) for Web Audio BGM.
 */
const BGM_CHORDS = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [164.81, 196.0, 246.94, 293.66], // Em7
  [146.83, 174.61, 220.0, 261.63], // Dm7
  [130.81, 164.81, 196.0, 246.94]  // Cmaj7
];

/**
 * Computes difficulty tier and dominance multiplier ratio from comment likes.
 * - winnerShare >= 75: Easy | 60-74: Medium | <= 59: Hard
 * - rawRatio < 1.5 uses 2 decimals (1.07x, 1.18x); otherwise 1 decimal (1.5x, 2.3x, 5.2x)
 */
function getRoundMetrics(comments) {
  const l1 = Number(comments?.[0]?.likes || 0);
  const l2 = Number(comments?.[1]?.likes || 0);
  const total = l1 + l2;
  const winnerShare = total > 0 ? Math.round((l1 / total) * 100) : 50;
  const runnerUpShare = 100 - winnerShare;

  const rawRatio = l2 > 0 ? l1 / l2 : 1;
  const formattedRatio = rawRatio < 1.5 ? rawRatio.toFixed(2) : rawRatio.toFixed(1);

  let tierKey = "hard";
  if (winnerShare >= 75) {
    tierKey = "easy";
  } else if (winnerShare >= 60) {
    tierKey = "medium";
  }

  return {
    winnerShare,
    runnerUpShare,
    rawRatio,
    formattedRatio,
    tier: DIFFICULTY_STYLES[tierKey]
  };
}

/**
 * Self-contained Web Audio API engine ("Glassy Tactile Pop" + warm lo-fi BGM loop).
 */
class GlassyAudioEngine {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.bgmChordIndex = 0;
    this.bgmPlaying = false;
    this.lastHoverAt = 0;
  }

  ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone({
    freqStart,
    freqEnd = null,
    type = "sine",
    duration = 0.08,
    volume = 0.25,
    delay = 0,
    attack = 0.004
  }) {
    const ctx = this.ensureContext();
    if (!ctx || volume <= 0.0001) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playHover(sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverAt < 60) return;
    this.lastHoverAt = nowMs;

    this.playTone({
      freqStart: 620,
      freqEnd: 780,
      type: "sine",
      duration: 0.032,
      volume: sfxVolume * 0.16,
      attack: 0.003
    });
  }

  playClick(sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    this.playTone({
      freqStart: 420,
      freqEnd: 260,
      type: "triangle",
      duration: 0.055,
      volume: sfxVolume * 0.42,
      attack: 0.002
    });
    this.playTone({
      freqStart: 940,
      freqEnd: 1220,
      type: "sine",
      duration: 0.04,
      volume: sfxVolume * 0.18,
      attack: 0.002
    });
  }

  playLeadIn(sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    this.playTone({
      freqStart: 220,
      freqEnd: 245,
      type: "sine",
      duration: 0.09,
      volume: sfxVolume * 0.28,
      delay: 0
    });
    this.playTone({
      freqStart: 260,
      freqEnd: 295,
      type: "sine",
      duration: 0.11,
      volume: sfxVolume * 0.34,
      delay: 0.11
    });
  }

  playVerdict(isCorrect, sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    if (isCorrect) {
      this.playTone({
        freqStart: 523.25, // C5
        type: "sine",
        duration: 0.16,
        volume: sfxVolume * 0.48,
        delay: 0
      });
      this.playTone({
        freqStart: 659.25, // E5
        type: "sine",
        duration: 0.2,
        volume: sfxVolume * 0.5,
        delay: 0.075
      });
      this.playTone({
        freqStart: 783.99, // G5
        type: "triangle",
        duration: 0.28,
        volume: sfxVolume * 0.34,
        delay: 0.14
      });
    } else {
      this.playTone({
        freqStart: 311.13, // Eb4
        freqEnd: 246.94,
        type: "triangle",
        duration: 0.18,
        volume: sfxVolume * 0.42,
        delay: 0
      });
      this.playTone({
        freqStart: 233.08, // Bb3
        freqEnd: 185.0,
        type: "sine",
        duration: 0.24,
        volume: sfxVolume * 0.36,
        delay: 0.09
      });
    }
  }

  playScoreTick(progress, sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    const freq = 480 + progress * 340;
    this.playTone({
      freqStart: freq,
      freqEnd: freq * 1.06,
      type: "sine",
      duration: 0.032,
      volume: sfxVolume * 0.16,
      attack: 0.002
    });
  }

  playScoreSettle(sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    this.playTone({
      freqStart: 880,
      freqEnd: 1046.5,
      type: "sine",
      duration: 0.14,
      volume: sfxVolume * 0.36,
      attack: 0.003
    });
  }

  playMultiplier(tierKey, sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    const notesByTier = {
      easy: [587.33, 739.99, 880.0],   // D5-F#5-A5
      medium: [523.25, 659.25, 880.0], // C5-E5-A5
      hard: [493.88, 622.25, 987.77]   // B4-D#5-B5
    };
    const notes = notesByTier[tierKey] || notesByTier.medium;
    notes.forEach((n, idx) => {
      this.playTone({
        freqStart: n,
        type: idx === 2 ? "triangle" : "sine",
        duration: 0.24,
        volume: sfxVolume * (idx === 2 ? 0.34 : 0.3),
        delay: idx * 0.055
      });
    });
  }

  playCallout(isCorrect, sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    if (isCorrect) {
      this.playTone({
        freqStart: 698.46,
        freqEnd: 1046.5,
        type: "sine",
        duration: 0.14,
        volume: sfxVolume * 0.42
      });
      this.playTone({
        freqStart: 1046.5,
        type: "triangle",
        duration: 0.22,
        volume: sfxVolume * 0.28,
        delay: 0.06
      });
    } else {
      this.playTone({
        freqStart: 349.23,
        freqEnd: 293.66,
        type: "sine",
        duration: 0.18,
        volume: sfxVolume * 0.34
      });
    }
  }

  playQ2Enter(sfxEnabled, sfxVolume) {
    if (!sfxEnabled || sfxVolume <= 0) return;
    this.playTone({
      freqStart: 440,
      freqEnd: 660,
      type: "sine",
      duration: 0.14,
      volume: sfxVolume * 0.24
    });
  }

  scheduleBgmChord() {
    if (!this.ctx || !this.bgmGain || !this.bgmPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chord = BGM_CHORDS[this.bgmChordIndex % BGM_CHORDS.length];
    this.bgmChordIndex = (this.bgmChordIndex + 1) % BGM_CHORDS.length;

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(780, now);

      const peak = i === 0 ? 0.28 : 0.16;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(peak, now + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.35);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start(now + i * 0.03);
      osc.stop(now + 2.45);
    });
  }

  setBgmState(shouldPlay, targetVolume) {
    if (!shouldPlay || targetVolume <= 0.0001) {
      this.pauseBgm();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.bgmGain) {
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);
    }

    const now = ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(Math.max(0.0001, this.bgmGain.gain.value), now);
    this.bgmGain.gain.linearRampToValueAtTime(targetVolume, now + 0.35);

    if (!this.bgmPlaying) {
      this.bgmPlaying = true;
      this.scheduleBgmChord();
      this.bgmInterval = setInterval(() => {
        this.scheduleBgmChord();
      }, 2400);
    }
  }

  pauseBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmPlaying = false;
    if (this.ctx && this.bgmGain) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(Math.max(0.0001, this.bgmGain.gain.value), now);
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);
    }
  }

  destroy() {
    this.pauseBgm();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

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

  // New Q1 reveal animation states
  const [q1Phase, setQ1Phase] = useState("pick"); // 'pick' | 'merge' | 'leadin' | 'verdict' | 'score' | 'diff-leadin' | 'multiplier' | 'callout'
  const [q1PillContentVisible, setQ1PillContentVisible] = useState(true);
  const [q1ExitingToQ2, setQ1ExitingToQ2] = useState(false);
  const [q1IsCorrect, setQ1IsCorrect] = useState(false);
  const [q1EarnedPoints, setQ1EarnedPoints] = useState(0);
  const [q1AnimatedPoints, setQ1AnimatedPoints] = useState(0);
  const [q1CalloutWord, setQ1CalloutWord] = useState("");

  // Q2 reveal states
  const [q2RevealStep, setQ2RevealStep] = useState(0);
  const [q2CounterVal, setQ2CounterVal] = useState(0);

  // Audio controls (DM Sans + Glassy Tactile Pop: BGM 5%, SFX 25%)
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [bgmVolume] = useState(DEFAULT_BGM_VOLUME);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxVolume] = useState(DEFAULT_SFX_VOLUME);
  const sfxEnabledRef = useRef(true);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const q1TimersRef = useRef([]);
  const q2TimersRef = useRef([]);
  const q1ScoreRafRef = useRef(null);
  const summaryTimerRef = useRef(null);
  const lastCalloutRef = useRef("");

  const currentReel = reels[currentRoundIndex] || reels[0];
  const currentMetrics = getRoundMetrics(currentReel.comments);

  // Initialize Web Audio engine once
  if (!audioRef.current) {
    audioRef.current = new GlassyAudioEngine();
  }

  // Inject DM Sans Google Font dynamically
  useEffect(() => {
    const id = "reelguessr-dm-sans-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..900;1,9..40,400..900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Unlock Web Audio on first user gesture
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.ensureContext();
      }
      setAudioUnlocked(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const clearQ1Timers = useCallback(() => {
    q1TimersRef.current.forEach((id) => clearTimeout(id));
    q1TimersRef.current = [];
    if (q1ScoreRafRef.current) {
      cancelAnimationFrame(q1ScoreRafRef.current);
      q1ScoreRafRef.current = null;
    }
  }, []);

  const clearQ2Timers = useCallback(() => {
    q2TimersRef.current.forEach((id) => clearTimeout(id));
    q2TimersRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearQ1Timers();
      clearQ2Timers();
      if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
      if (audioRef.current) audioRef.current.destroy();
    };
  }, [clearQ1Timers, clearQ2Timers]);

  // Strict BGM rule: pause during Reel video (stage === 1) AND whenever any Q1 or Q2 results are shown (stage 2.5, 3.5, 4)
  const isResultsShowing =
    gameStarted && !isSummary && (stage === 2.5 || stage === 3.5 || stage === 4);
  const isWatchingReel = gameStarted && !isSummary && stage === 1;
  const shouldPlayBgm =
    audioUnlocked && bgmEnabled && !isWatchingReel && !isResultsShowing;

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.setBgmState(shouldPlayBgm, bgmVolume);
  }, [shouldPlayBgm, bgmVolume]);

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
    const n =
      typeof numStr === "string"
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

  const playHover = () => {
    audioRef.current?.playHover(sfxEnabledRef.current, sfxVolume);
  };

  const playClick = () => {
    audioRef.current?.playClick(sfxEnabledRef.current, sfxVolume);
  };

  const pickCalloutPhrase = (tierKey, isCorrect) => {
    const pool = CALLOUT_POOLS[tierKey]?.[isCorrect ? "correct" : "incorrect"] || ["Nice!"];
    if (pool.length <= 1) return pool[0];
    const filtered = pool.filter((w) => w !== lastCalloutRef.current);
    const source = filtered.length > 0 ? filtered : pool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    lastCalloutRef.current = chosen;
    return chosen;
  };

  const runQ1ScoreCountUp = (targetScore) => {
    if (q1ScoreRafRef.current) {
      cancelAnimationFrame(q1ScoreRafRef.current);
      q1ScoreRafRef.current = null;
    }
    const duration = 560;
    const start = performance.now();
    let lastTickIdx = -1;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setQ1AnimatedPoints(Math.round(targetScore * eased));

      const tickBucket = Math.floor(t * 7);
      if (tickBucket > lastTickIdx && t < 1) {
        lastTickIdx = tickBucket;
        audioRef.current?.playScoreTick(t, sfxEnabledRef.current, sfxVolume);
      }

      if (t < 1) {
        q1ScoreRafRef.current = requestAnimationFrame(tick);
      } else {
        setQ1AnimatedPoints(targetScore);
        audioRef.current?.playScoreSettle(sfxEnabledRef.current, sfxVolume);
        q1ScoreRafRef.current = null;
      }
    };

    q1ScoreRafRef.current = requestAnimationFrame(tick);
  };

  const scheduleQ1 = (fn, delay) => {
    const id = setTimeout(fn, delay);
    q1TimersRef.current.push(id);
    return id;
  };

  const scheduleQ2 = (fn, delay) => {
    const id = setTimeout(fn, delay);
    q2TimersRef.current.push(id);
    return id;
  };

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

  /**
   * Full 8-beat Q1 animation sequence:
   * Merge (350ms) -> 1a. Verdict Lead-In (1500ms) -> 1b. Verdict (1200ms)
   * -> 2. Score (2000ms) -> 3a. Diff Lead-In (1200ms) -> 3b. Multiplier (1200ms)
   * -> 4. Callout (800ms) -> Auto-transition to Question 2 (stage 3)
   */
  const handleSelectComment = (comment) => {
    if (stage !== 2 || q1Phase !== "pick") return;
    clearQ1Timers();
    playClick();

    const topComment = currentReel.comments[0];
    const metrics = getRoundMetrics(currentReel.comments);
    const correct = comment.rank === 1;
    const pts = calcPart1Score(comment.likes, topComment.likes);
    const chosenWord = pickCalloutPhrase(metrics.tier.key, correct);

    setSelectedCommentId(comment.id);
    setQ1IsCorrect(correct);
    setQ1EarnedPoints(pts);
    setQ1AnimatedPoints(0);
    setQ1CalloutWord(chosenWord);
    setQ1ExitingToQ2(false);
    setQ1PillContentVisible(false);

    setStage(2.5);
    setQ1Phase("merge");

    const t1aStart = MERGE_DURATION_MS;
    const t1bStart = t1aStart + LEAD_IN_MS;
    const t2Start = t1bStart + VERDICT_MS;
    const t3aStart = t2Start + SCORE_MS;
    const t3bStart = t3aStart + DIFF_LEAD_IN_MS;
    const t4Start = t3bStart + MULTIPLIER_MS;
    const tQ2Start = t4Start + CALLOUT_MS;

    // 1a. Verdict Lead-In ("YOU CHOSE")
    scheduleQ1(() => {
      setQ1Phase("leadin");
      setQ1PillContentVisible(true);
      audioRef.current?.playLeadIn(sfxEnabledRef.current, sfxVolume);
    }, t1aStart);

    // 1b. Verdict ("THE [RIGHT/WRONG] COMMENT")
    scheduleQ1(() => {
      setQ1Phase("verdict");
      setQ1PillContentVisible(true);
      audioRef.current?.playVerdict(correct, sfxEnabledRef.current, sfxVolume);
    }, t1bStart);

    // Fade out before 2. Score
    scheduleQ1(() => {
      setQ1PillContentVisible(false);
    }, Math.max(t1bStart + 60, t2Start - TEXT_SWAP_GAP_MS));

    // 2. Score (+X,XXX PTS)
    scheduleQ1(() => {
      setQ1Phase("score");
      setQ1PillContentVisible(true);
      runQ1ScoreCountUp(pts);
    }, t2Start);

    // Fade out before 3a. Diff Lead-In
    scheduleQ1(() => {
      setQ1PillContentVisible(false);
    }, Math.max(t2Start + 60, t3aStart - TEXT_SWAP_GAP_MS));

    // 3a. Diff Lead-In ("RANK 1 COMMENT HAD")
    scheduleQ1(() => {
      setQ1Phase("diff-leadin");
      setQ1PillContentVisible(true);
      audioRef.current?.playLeadIn(sfxEnabledRef.current, sfxVolume);
    }, t3aStart);

    // 3b. Multiplier ("{ratio}× MORE ❤️s" + "Difficulty: [Easy/Medium/Hard]")
    scheduleQ1(() => {
      setQ1Phase("multiplier");
      setQ1PillContentVisible(true);
      audioRef.current?.playMultiplier(metrics.tier.key, sfxEnabledRef.current, sfxVolume);
    }, t3bStart);

    // Fade out before 4. Callout
    scheduleQ1(() => {
      setQ1PillContentVisible(false);
    }, Math.max(t3bStart + 60, t4Start - TEXT_SWAP_GAP_MS));

    // 4. Callout
    scheduleQ1(() => {
      setQ1Phase("callout");
      setQ1PillContentVisible(true);
      audioRef.current?.playCallout(correct, sfxEnabledRef.current, sfxVolume);
    }, t4Start);

    // Smooth exit into Question 2
    scheduleQ1(() => {
      setQ1ExitingToQ2(true);
    }, Math.max(t4Start + 80, tQ2Start - 240));

    // 5. Auto-advance to Question 2
    scheduleQ1(() => {
      setQ1ExitingToQ2(false);
      setQ1Phase("pick");
      setQ2RevealStep(0);
      setStage(3);
      audioRef.current?.playQ2Enter(sfxEnabledRef.current, sfxVolume);
    }, tQ2Start);
  };

  const handleLockInEstimate = () => {
    clearQ2Timers();
    playClick();
    setStage(3.5);
    setQ2RevealStep(1);

    const actualVal = currentReel.comments[0].likes;
    const speedMs = 100;
    let step = 0;

    const jump = () => {
      step++;
      if (step === 1) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.2 + 0.1)));
        audioRef.current?.playScoreTick(0.25, sfxEnabledRef.current, sfxVolume);
        scheduleQ2(jump, speedMs);
      } else if (step === 2) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.3 + 0.3)));
        audioRef.current?.playScoreTick(0.55, sfxEnabledRef.current, sfxVolume);
        scheduleQ2(jump, speedMs);
      } else if (step === 3) {
        setQ2CounterVal(Math.floor(actualVal * (Math.random() * 0.2 + 0.7)));
        audioRef.current?.playScoreTick(0.85, sfxEnabledRef.current, sfxVolume);
        scheduleQ2(jump, speedMs);
      } else {
        setQ2CounterVal(actualVal);
        setQ2RevealStep(2);
        audioRef.current?.playScoreSettle(sfxEnabledRef.current, sfxVolume);

        scheduleQ2(() => {
          setQ2RevealStep(3);
          const topComment = currentReel.comments[0];
          const p2Pts = calcPart2Score(guessLikes, topComment.likes);
          audioRef.current?.playVerdict(p2Pts >= 5000, sfxEnabledRef.current, sfxVolume);

          scheduleQ2(() => {
            const pickedComment = currentReel.comments.find((c) => c.id === selectedCommentId);
            const metrics = getRoundMetrics(currentReel.comments);

            const part1 = calcPart1Score(pickedComment.likes, topComment.likes);
            const part2 = calcPart2Score(guessLikes, topComment.likes);
            const total = part1 + part2;

            const newResult = {
              round: currentReel.round,
              url: currentReel.url,
              pickedRank: pickedComment.rank,
              difficulty: metrics.tier,
              estimateRating: getEstimateRating(guessLikes, topComment.likes),
              part1Score: part1,
              guessedLikes: guessLikes,
              actualTopLikes: topComment.likes,
              part2Score: part2,
              totalScore: total
            };

            setResults((prev) => {
              const updated = [...prev];
              updated[currentRoundIndex] = newResult;
              return updated;
            });
            setStage(4);
          }, 1500);
        }, 1000);
      }
    };
    jump();
  };

  const handleNextRoundOrSummary = () => {
    clearQ1Timers();
    clearQ2Timers();
    playClick();

    if (currentRoundIndex < reels.length - 1) {
      setCurrentRoundIndex(currentRoundIndex + 1);
      setSelectedCommentId(null);
      setQ1Phase("pick");
      setQ1ExitingToQ2(false);
      setQ1PillContentVisible(true);
      setQ2RevealStep(0);
      setStage(1);
    } else {
      const grandTotal = results.reduce((acc, r) => acc + (r ? r.totalScore : 0), 0);
      setIsSummary(true);
      startScoreAnimation(grandTotal);
    }
  };

  const startScoreAnimation = (grandTotal) => {
    if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
    let current = 0;
    const step = Math.max(1, Math.ceil(grandTotal / 50));
    summaryTimerRef.current = setInterval(() => {
      current += step;
      if (current >= grandTotal) {
        current = grandTotal;
        clearInterval(summaryTimerRef.current);
        summaryTimerRef.current = null;
        audioRef.current?.playVerdict(true, sfxEnabledRef.current, sfxVolume);
      }
      setAnimatedScore(current);
    }, 16);
  };

  const restartTest = () => {
    clearQ1Timers();
    clearQ2Timers();
    if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
    playClick();

    setIsSummary(false);
    setCurrentRoundIndex(0);
    setSelectedCommentId(null);
    setResults([]);
    setQ1Phase("pick");
    setQ1ExitingToQ2(false);
    setQ1PillContentVisible(true);
    setQ2RevealStep(0);
    setStage(1);
    setGameStarted(true);
  };

  const goHome = () => {
    clearQ1Timers();
    clearQ2Timers();
    if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
    playClick();

    setIsSummary(false);
    setGameStarted(false);
    setCurrentRoundIndex(0);
    setSelectedCommentId(null);
    setResults([]);
    setQ1Phase("pick");
    setQ1ExitingToQ2(false);
    setQ1PillContentVisible(true);
    setQ2RevealStep(0);
    setStage(1);
  };

  const grandTotalScore = results.reduce((acc, r) => acc + (r ? r.totalScore : 0), 0);

  const getQ1PillAppearance = () => {
    if (q1Phase === "merge" || q1Phase === "leadin" || q1Phase === "diff-leadin") {
      return NEUTRAL_LEAD_IN_STYLE;
    }
    if (q1Phase === "multiplier") {
      return {
        backgroundColor: currentMetrics.tier.pillBg,
        borderColor: currentMetrics.tier.pillBorder,
        boxShadow: currentMetrics.tier.pillShadow
      };
    }
    if (q1Phase === "verdict" || q1Phase === "score" || q1Phase === "callout") {
      return q1IsCorrect
        ? {
            backgroundColor: "#10b981",
            borderColor: "rgba(52, 211, 153, 0.55)",
            boxShadow: "0 18px 46px -10px rgba(16, 185, 129, 0.48)"
          }
        : {
            backgroundColor: "#e11d48",
            borderColor: "rgba(251, 113, 133, 0.55)",
            boxShadow: "0 18px 46px -10px rgba(225, 29, 72, 0.48)"
          };
    }
    return NEUTRAL_LEAD_IN_STYLE;
  };

  const renderCommentCard = ({ username, text, onClick, isInteractive = false, badgeText = null }) => {
    const Wrapper = isInteractive ? "button" : "div";
    return (
      <Wrapper
        onClick={onClick}
        onMouseEnter={isInteractive ? playHover : undefined}
        className={`w-full text-left p-4 rounded-2xl bg-[#1f2937] border border-gray-700/80 flex items-start gap-3.5 shadow-lg transition ${
          isInteractive
            ? "hover:border-pink-500 hover:bg-[#263244] active:scale-[0.99] cursor-pointer group"
            : ""
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-0.5 flex-shrink-0 mt-0.5 shadow-md">
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
              <span className="text-xs font-semibold text-gray-400 group-hover:text-pink-400 transition shrink-0">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-base mt-1 text-white leading-snug break-words font-normal">{text}</p>
        </div>
      </Wrapper>
    );
  };

  // Header BGM status text
  const bgmStatusLabel = !bgmEnabled
    ? "BGM: Off"
    : isWatchingReel
    ? "BGM: Paused (Reel)"
    : isResultsShowing
    ? "BGM: Paused (Results)"
    : "BGM: 5%";

  return (
    <div
      style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}
      className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] selection:bg-pink-500 selection:text-white antialiased"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..900;1,9..40,400..900&display=swap');

        @keyframes dropIn { 0% { opacity: 0; transform: translateY(-20px) scale(1.5); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-drop-in { animation: dropIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes floatUpFade { 0% { opacity: 0; transform: translateY(15px) scale(0.9); } 15% { opacity: 1; transform: translateY(-5px) scale(1.1); } 80% { opacity: 1; transform: translateY(-25px) scale(1); } 100% { opacity: 0; transform: translateY(-35px) scale(0.9); } }
        .animate-float-score { animation: floatUpFade 1.6s ease-out forwards; }
        @keyframes slideInLeft { 0% { opacity: 0; transform: translateX(-30px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-fade { animation: slideUpFade 0.4s ease-out forwards; }

        @keyframes pillSpringIn {
          0% { opacity: 0; transform: scale(0.84); border-radius: 1.5rem; }
          65% { opacity: 1; transform: scale(1.025); border-radius: 9999px; }
          100% { opacity: 1; transform: scale(1); border-radius: 9999px; }
        }
        .animate-pill-spring { animation: pillSpringIn 0.34s cubic-bezier(0.34, 1.45, 0.64, 1) forwards; }

        @keyframes leadInFadeScale {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-leadin-text { animation: leadInFadeScale 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes verdictSpringIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.82); }
          62% { opacity: 1; transform: translateY(-2px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-verdict-spring { animation: verdictSpringIn 0.36s cubic-bezier(0.34, 1.52, 0.64, 1) forwards; }

        @keyframes accentBadgePop {
          0% { opacity: 0; transform: scale(0.65) rotate(-3deg); }
          55% { opacity: 1; transform: scale(1.12) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-accent-badge { animation: accentBadgePop 0.42s cubic-bezier(0.34, 1.65, 0.64, 1) 0.06s both; }

        @keyframes scorePop {
          0% { opacity: 0; transform: scale(0.84) translateY(8px); }
          60% { opacity: 1; transform: scale(1.05) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-score-pop { animation: scorePop 0.36s cubic-bezier(0.22, 1.28, 0.36, 1) forwards; }

        @keyframes calloutPunch {
          0% { opacity: 0; transform: scale(0.66) rotate(-1.5deg); }
          58% { opacity: 1; transform: scale(1.07) rotate(0.4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-callout-punch { animation: calloutPunch 0.34s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes heartBeatPop {
          0% { opacity: 0; transform: scale(0.5); }
          58% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-heart-pop { animation: heartBeatPop 0.42s cubic-bezier(0.34, 1.65, 0.64, 1) 0.08s both; }

        @keyframes q2SlideIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-q2-enter { animation: q2SlideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>

      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={goHome}
            onMouseEnter={playHover}
          >
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onMouseEnter={playHover}
              onClick={() => {
                playClick();
                setBgmEnabled((v) => !v);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                bgmEnabled && !isWatchingReel && !isResultsShowing
                  ? "bg-pink-500/15 text-pink-300 border-pink-500/35 hover:bg-pink-500/25"
                  : bgmEnabled
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="Toggle Background Music (auto-pauses on Reels and Q1/Q2 results)"
            >
              {bgmEnabled ? "🎵" : "🔇"} {bgmStatusLabel}
            </button>

            <button
              type="button"
              onMouseEnter={playHover}
              onClick={() => {
                const next = !sfxEnabled;
                setSfxEnabled(next);
                if (next) audioRef.current?.playClick(true, sfxVolume);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                sfxEnabled
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="Toggle UI & Animation Sound Effects"
            >
              {sfxEnabled ? "🔊 SFX: 25%" : "🔇 SFX: Off"}
            </button>

            <button
              type="button"
              onMouseEnter={playHover}
              onClick={restartTest}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            >
              🔄 Restart
            </button>

            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
              <span className="text-xs text-zinc-400">Score:</span>
              <span className="font-bold text-sm text-white tabular-nums">{fmt(grandTotalScore)}</span>
              <span className="text-[11px] text-zinc-500 tabular-nums">/ 100K</span>
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
            Spot the #1 most-liked comment and estimate its like count for a maximum of{" "}
            <strong className="text-zinc-200">100,000 points</strong>.
          </p>
          <button
            type="button"
            onMouseEnter={playHover}
            onClick={() => {
              playClick();
              setAudioUnlocked(true);
              setGameStarted(true);
            }}
            className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-extrabold text-base shadow-xl hover:opacity-95 transition active:scale-95 cursor-pointer"
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
                      {done && (
                        <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
                          {fmt(done.totalScore)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Game Card Header — Difficulty badge stays hidden until Q1 animation finishes so Step 3b isn't spoiled */}
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between z-30 relative">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Round {currentReel.round} of 5
                  </span>
                </div>

                {stage >= 3 ? (
                  <span
                    style={{
                      backgroundColor: currentMetrics.tier.badgeBg,
                      borderColor: currentMetrics.tier.badgeBorder,
                      color: currentMetrics.tier.badgeText
                    }}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border"
                  >
                    Difficulty: {currentMetrics.tier.label}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {stage === 1
                      ? "Watch Reel"
                      : stage === 1.5
                      ? "Ready to Guess"
                      : stage === 2
                      ? "Question 1 of 2"
                      : "Question 1 Results"}
                  </span>
                )}
              </div>

              <div
                className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden pt-4 pb-4"
                style={{ minHeight: "680px" }}
              >
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
                      type="button"
                      onMouseEnter={playHover}
                      onClick={togglePlayPause}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition z-30 cursor-pointer"
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
                        <span className="text-[13px] font-semibold text-white tracking-tight tabular-nums">
                          {formatShort(currentReel.stats.views)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <svg className="w-7 h-7 text-white fill-transparent stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                        </svg>
                        <span className="text-[13px] font-semibold text-white tracking-tight tabular-nums">
                          {formatShort(currentReel.stats.comments)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <svg className="w-7 h-7 text-white fill-transparent stroke-current stroke-[1.8]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span className="text-[13px] font-semibold text-white tracking-tight tabular-nums">
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
                        <button
                          type="button"
                          onClick={() => setMuted(!muted)}
                          className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] p-1 hover:scale-110 transition cursor-pointer"
                        >
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
                        type="button"
                        onMouseEnter={playHover}
                        onClick={() => {
                          playClick();
                          if (videoRef.current) videoRef.current.currentTime = 0;
                          setStage(1);
                        }}
                        className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-sm border border-zinc-700 transition cursor-pointer"
                      >
                        ↺ Rewatch Reel
                      </button>
                      <button
                        type="button"
                        onMouseEnter={playHover}
                        onClick={() => {
                          playClick();
                          setQ1Phase("pick");
                          setStage(2);
                        }}
                        className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-bold text-sm shadow-lg hover:opacity-95 transition cursor-pointer"
                      >
                        Start Guessing →
                      </button>
                    </div>
                  </div>
                )}

                {/* Unified Q1 Picking & 8-Beat Merged Pill Animation Overlay (stage 2 & stage 2.5) */}
                {(stage === 2 || stage === 2.5) && (() => {
                  const isPillMounted =
                    q1Phase === "merge" ||
                    q1Phase === "leadin" ||
                    q1Phase === "verdict" ||
                    q1Phase === "score" ||
                    q1Phase === "diff-leadin" ||
                    q1Phase === "multiplier" ||
                    q1Phase === "callout";
                  const isStep1 = q1Phase === "leadin" || q1Phase === "verdict";
                  const isVerdictActive = q1Phase === "verdict";
                  const isStep3 = q1Phase === "diff-leadin" || q1Phase === "multiplier";
                  const isMultiplierActive = q1Phase === "multiplier";
                  const pillStyle = getQ1PillAppearance();

                  return (
                    <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
                      <div
                        className={`flex-1 flex flex-col justify-between transition-all duration-300 ease-out ${
                          q1ExitingToQ2
                            ? "opacity-0 -translate-y-4 scale-[0.98]"
                            : "opacity-100 translate-y-0 scale-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {stage === 2 ? (
                            <button
                              type="button"
                              onMouseEnter={playHover}
                              onClick={() => {
                                playClick();
                                setStage(1);
                              }}
                              className="text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 px-3.5 py-1.5 rounded-full hover:bg-zinc-800 transition cursor-pointer"
                            >
                              ← Rewatch Reel
                            </button>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                              Question 1 Results
                            </span>
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                            {stage === 2 ? "Question 1 of 2" : "Auto-advancing…"}
                          </span>
                        </div>

                        <div className="my-auto py-4 max-w-xl mx-auto w-full">
                          <div
                            className={`text-center mb-6 transition-all duration-300 ${
                              q1Phase === "pick"
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2 pointer-events-none select-none"
                            }`}
                          >
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                              Which comment got the most likes?
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">
                              Tap the comment you think ranked #1 (Worth up to 10,000 pts)
                            </p>
                          </div>

                          <div className="relative min-h-[228px] flex items-center justify-center">
                            {(q1Phase === "pick" || q1Phase === "merge") && (
                              <div className="w-full flex flex-col gap-4">
                                {DISPLAY_ORDERS[currentRoundIndex % DISPLAY_ORDERS.length].map(
                                  (cIdx, dispIdx) => {
                                    const c = currentReel.comments[cIdx];
                                    const isMerging = q1Phase === "merge";
                                    const mergeTransformClass = isMerging
                                      ? dispIdx === 0
                                        ? "translate-y-[54px] scale-[0.94] opacity-0 pointer-events-none"
                                        : "-translate-y-[54px] scale-[0.94] opacity-0 pointer-events-none"
                                      : "translate-y-0 scale-100 opacity-100";

                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        disabled={isMerging}
                                        onMouseEnter={!isMerging ? playHover : undefined}
                                        onClick={() => handleSelectComment(c)}
                                        className={`w-full text-left p-4 rounded-2xl bg-[#1f2937] border border-gray-700/80 flex items-start gap-3.5 shadow-lg transition-all duration-300 ease-in-out ${
                                          isMerging
                                            ? ""
                                            : "hover:border-pink-500 hover:bg-[#263244] active:scale-[0.99] cursor-pointer group"
                                        } ${mergeTransformClass}`}
                                      >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-0.5 flex-shrink-0 mt-0.5 shadow-md">
                                          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                                            <svg
                                              className="w-5 h-5 text-gray-400 fill-current"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-gray-300 truncate">
                                              @{c.username}
                                            </p>
                                            <span className="text-xs font-semibold text-gray-400 group-hover:text-pink-400 transition shrink-0">
                                              Option {dispIdx === 0 ? "A" : "B"} • Select →
                                            </span>
                                          </div>
                                          <p className="text-base mt-1 text-white leading-snug break-words font-normal">
                                            {c.text}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {isPillMounted && q1Phase !== "merge" && (
                              <div className="w-full flex items-center justify-center animate-pill-spring">
                                <div
                                  style={{
                                    backgroundColor: pillStyle.backgroundColor,
                                    borderColor: pillStyle.borderColor,
                                    boxShadow: pillStyle.boxShadow
                                  }}
                                  className="relative w-full max-w-[500px] min-h-[144px] sm:min-h-[156px] rounded-full border-2 px-7 sm:px-10 py-6 flex items-center justify-center text-center transition-[background-color,border-color,box-shadow] duration-500 ease-out overflow-hidden"
                                >
                                  <div
                                    className={`w-full flex flex-col items-center justify-center transition-all duration-200 ease-out ${
                                      q1PillContentVisible
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-95"
                                    }`}
                                  >
                                    {/* STEP 1a ("YOU CHOSE") & STEP 1b ("THE [RIGHT/WRONG] COMMENT") */}
                                    {isStep1 && (
                                      <div className="relative w-full flex flex-col items-center justify-center">
                                        <div
                                          style={{
                                            transform: isVerdictActive
                                              ? "translateY(0px) scale(1)"
                                              : "translateY(22px) scale(1.14)",
                                            color: isVerdictActive
                                              ? "rgba(255, 255, 255, 0.90)"
                                              : "#f4f4f5"
                                          }}
                                          className={`leading-none uppercase transition-all duration-300 ease-out animate-leadin-text ${
                                            isVerdictActive
                                              ? "tracking-widest text-xs font-extrabold"
                                              : "tracking-[0.12em] text-sm sm:text-base font-black"
                                          }`}
                                        >
                                          YOU CHOSE
                                        </div>

                                        <div className="h-[48px] mt-1.5 flex items-center justify-center">
                                          {isVerdictActive && (
                                            <div
                                              key={`verdict-${q1IsCorrect ? "right" : "wrong"}`}
                                              className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none animate-verdict-spring"
                                            >
                                              <span>THE</span>
                                              <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full bg-white shadow-md font-black tracking-wide animate-accent-badge ${
                                                  q1IsCorrect
                                                    ? "text-emerald-700"
                                                    : "text-rose-700"
                                                }`}
                                              >
                                                {q1IsCorrect ? "RIGHT" : "WRONG"}
                                              </span>
                                              <span>COMMENT</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* STEP 2: Score Reveal ONLY */}
                                    {q1Phase === "score" && (
                                      <div
                                        key="step-score"
                                        className="animate-score-pop flex flex-col items-center justify-center"
                                      >
                                        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                                          +{fmt(q1AnimatedPoints)} PTS
                                        </div>
                                      </div>
                                    )}

                                    {/* STEP 3a ("RANK 1 COMMENT HAD") & STEP 3b ("{ratio}× MORE ❤️s" + "Difficulty: ...") */}
                                    {isStep3 && (
                                      <div className="relative w-full flex flex-col items-center justify-center">
                                        <div
                                          style={{
                                            transform: isMultiplierActive
                                              ? "translateY(0px) scale(1)"
                                              : "translateY(33px) scale(1.14)",
                                            color: isMultiplierActive
                                              ? currentMetrics.tier.eyebrowColor
                                              : "#f4f4f5"
                                          }}
                                          className={`leading-none uppercase transition-all duration-300 ease-out animate-leadin-text ${
                                            isMultiplierActive
                                              ? "tracking-widest text-xs font-extrabold"
                                              : "tracking-[0.12em] text-sm sm:text-base font-black"
                                          }`}
                                        >
                                          RANK 1 COMMENT HAD
                                        </div>

                                        <div className="h-[46px] mt-1.5 flex items-center justify-center">
                                          {isMultiplierActive && (
                                            <div
                                              key={`multiplier-${currentReel.round}`}
                                              style={{ color: currentMetrics.tier.textColor }}
                                              className="flex items-center justify-center gap-2.5 text-3xl sm:text-[42px] font-black uppercase tracking-tight leading-none animate-verdict-spring"
                                            >
                                              <span className="tabular-nums">
                                                {currentMetrics.formattedRatio}
                                                <span className="text-[0.7em] ml-[1px]">×</span>
                                              </span>
                                              <span>MORE</span>
                                              <span className="inline-flex items-baseline animate-heart-pop">
                                                <svg
                                                  className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 self-center"
                                                  viewBox="0 0 24 24"
                                                  fill={currentMetrics.tier.heartColor}
                                                  aria-label="likes"
                                                >
                                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                                <span className="normal-case leading-none">s</span>
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="h-[16px] mt-1.5 flex items-center justify-center">
                                          {isMultiplierActive && (
                                            <div
                                              key={`difficulty-${currentReel.round}`}
                                              style={{ color: currentMetrics.tier.eyebrowColor }}
                                              className="leading-none uppercase tracking-widest text-xs font-extrabold animate-leadin-text"
                                            >
                                              Difficulty: {currentMetrics.tier.label}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* STEP 4: Callout Word ONLY */}
                                    {q1Phase === "callout" && (
                                      <div
                                        key="step-callout"
                                        className="animate-callout-punch flex flex-col items-center justify-center"
                                      >
                                        <div className="text-3xl sm:text-[42px] font-black text-white tracking-tight leading-tight px-2">
                                          {q1CalloutWord}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="h-5" />
                      </div>
                    </div>
                  );
                })()}

                {stage === 3 && (() => {
                  const picked = currentReel.comments.find((c) => c.id === selectedCommentId);
                  const isCorrect = picked?.rank === 1;
                  const topComment = currentReel.comments[0];
                  const earnedPts = picked ? calcPart1Score(picked.likes, topComment.likes) : q1EarnedPoints;

                  return (
                    <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-q2-enter">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onMouseEnter={playHover}
                            onClick={() => {
                              playClick();
                              setStage(1);
                            }}
                            className="text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 px-3.5 py-1.5 rounded-full hover:bg-zinc-800 transition cursor-pointer"
                          >
                            👁️ Peek at Reel
                          </button>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border tabular-nums ${
                              isCorrect
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            Q1: +{fmt(earnedPts)} pts
                          </span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Question 2 of 2
                        </span>
                      </div>

                      <div className="my-auto py-4 max-w-xl mx-auto w-full flex flex-col gap-5">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                            🏆 Actual #1 Most-Liked Comment
                          </div>
                          {renderCommentCard({
                            username: topComment.username,
                            text: topComment.text,
                            isInteractive: false
                          })}
                        </div>
                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 text-center shadow-lg">
                          <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                            How many likes did it get?
                          </p>
                          <p className="text-4xl font-black text-pink-500 mb-5 tabular-nums">
                            {fmt(guessLikes)}
                          </p>
                          <input
                            type="range"
                            min={activeSliderCfg.min}
                            max={activeSliderCfg.max}
                            step={activeSliderCfg.step}
                            value={guessLikes}
                            onChange={(e) => setGuessLikes(Number(e.target.value))}
                            className="w-full accent-pink-500 h-2 bg-gray-700 rounded-lg cursor-pointer mb-2"
                          />
                          <div className="flex justify-between text-xs text-gray-400 font-semibold px-1 tabular-nums">
                            <span>{fmt(activeSliderCfg.min)}</span>
                            <span>{fmt(activeSliderCfg.max)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onMouseEnter={playHover}
                          onClick={handleLockInEstimate}
                          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-4 rounded-2xl shadow-lg transform transition active:scale-95 text-lg cursor-pointer"
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
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Question 2 Reveal
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">Calculating Score...</span>
                      </div>

                      <div className="my-auto py-4 max-w-md mx-auto w-full flex flex-col gap-5">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 text-center">
                            🏆 Actual #1 Most-Liked Comment
                          </div>
                          {renderCommentCard({
                            username: topComment.username,
                            text: topComment.text,
                            isInteractive: false
                          })}
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
                                <p className="text-2xl font-black text-pink-500 tabular-nums">{fmt(guessLikes)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Actual Likes</p>
                                <p className="text-3xl font-black text-white tabular-nums">{fmt(q2CounterVal)}</p>
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

                            <div className="flex justify-between w-full text-xs text-gray-400 font-semibold px-1 mt-2 tabular-nums">
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
                              <div className="text-white font-black text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-float-score tabular-nums">
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
                  const pctOff = (
                    (Math.abs(res.actualTopLikes - res.guessedLikes) / res.actualTopLikes) *
                    100
                  ).toFixed(1);

                  return (
                    <div className="absolute inset-0 z-40 bg-[#0f141e] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                          Round {currentReel.round} of 5 Results
                        </span>
                        <span className="text-sm font-bold text-zinc-300 tabular-nums">
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
                              <p className="text-xs font-bold text-[#bc1888] mt-1 tabular-nums">
                                {fmt(topComment.likes)} Likes
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{ animationDelay: "0.4s" }}
                          className="bg-[#1e2532] border border-[#2a3441] rounded-2xl p-4 opacity-0 animate-slide-in-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[15px] font-semibold text-white">Q1: Comment Ranking</span>
                            <span className="text-[22px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent tabular-nums">
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
                            <span className="text-[22px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent tabular-nums">
                              +{fmt(res.part2Score)}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold uppercase text-[#718096] mt-1.5 tabular-nums">
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
                          <span className="text-lg font-extrabold uppercase tracking-wider text-white">
                            Round Total
                          </span>
                          <span className="text-[28px] font-extrabold bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent tabular-nums">
                            {fmt(res.totalScore)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onMouseEnter={playHover}
                          onClick={handleNextRoundOrSummary}
                          style={{ animationDelay: "1.5s" }}
                          className="w-full mt-2 bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-2xl shadow-lg transform transition active:scale-95 text-base opacity-0 animate-slide-up-fade cursor-pointer"
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
                    type="button"
                    onMouseEnter={playHover}
                    onClick={() => {
                      playClick();
                      if (!selectedCommentId) setQ1Phase("pick");
                      setStage(selectedCommentId ? 3 : 2);
                    }}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition cursor-pointer"
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
                {grandTotalScore >= 80000
                  ? "👑 Certified Doomscroll Grandmaster"
                  : "🎯 Comment Section Connoisseur"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Your Final Score</h2>
              <div className="mt-3 text-6xl sm:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] tabular-nums">
                {fmt(animatedScore)}
              </div>
              <p className="text-xs text-zinc-500 mt-2 tabular-nums">out of 100,000 max points</p>

              {animatedScore === grandTotalScore && grandTotalScore > 0 && (
                <div className="mt-6 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex flex-col items-center">
                  <p className="text-sm text-zinc-400 font-medium">You scored higher than</p>
                  <p className="text-4xl font-black text-emerald-400 mt-1 tabular-nums">
                    {getPercentile(grandTotalScore)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                    of players today
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onMouseEnter={playHover}
                onClick={goHome}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition cursor-pointer"
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
