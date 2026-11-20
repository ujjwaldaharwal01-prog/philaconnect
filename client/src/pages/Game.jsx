import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../utils/auth';

const GAME_DURATION = 60;
const ITEM_TYPES = {
  stamp: { points: 10, color: '#2f6b4f', emoji: '📮' },
  golden: { points: 40, color: '#d4af37', emoji: '⭐' },
  bomb: { points: 0, color: '#1a1a1a', emoji: '💣' },
};

export default function Game() {
  const canvasRef = useRef(null);
  const basketXRef = useRef(0.5); // 0 to 1, fraction of width
  const stateRef = useRef({
    items: [],
    particles: [],
    score: 0,
    lives: 3,
    combo: 1,
    timeLeft: GAME_DURATION,
    lastSpawn: 0,
    spawnInterval: 1200,
    running: false,
  });

  const [uiScore, setUiScore] = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiTime, setUiTime] = useState(GAME_DURATION);
  const [uiCombo, setUiCombo] = useState(1);
  const [phase, setPhase] = useState('start'); // start | playing | over | claimed
  const [credits, setCredits] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedCredits, setClaimedCredits] = useState(0);

  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (loggedIn) {
      fetch('/api/game/credits', { headers: { Authorization: `Bearer ${getToken()}` } })
        .then((r) => r.json())
        .then((d) => setCredits(d.credits))
        .catch(() => {});
    }
  }, [loggedIn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = 420;
    }
    resize();
    window.addEventListener('resize', resize);

    function pointerMove(clientX) {
      const rect = canvas.getBoundingClientRect();
      basketXRef.current = Math.max(0.06, Math.min(0.94, (clientX - rect.left) / rect.width));
    }
    const onMouseMove = (e) => pointerMove(e.clientX);
    const onTouchMove = (e) => { if (e.touches[0]) pointerMove(e.touches[0].clientX); };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    const keys = {};
    const onKeyDown = (e) => (keys[e.key] = true);
    const onKeyUp = (e) => (keys[e.key] = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let rafId;
    let lastTime = performance.now();

    function spawnItem() {
      const roll = Math.random();
      const type = roll < 0.08 ? 'golden' : roll < 0.3 ? 'bomb' : 'stamp';
      stateRef.current.items.push({
        type,
        x: Math.random() * 0.86 + 0.07,
        y: -0.05,
        speed: 0.00025 + Math.random() * 0.00015 + stateRef.current.score * 0.0000006,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      });
    }

    function burst(x, y, color, text) {
      for (let i = 0; i < 10; i++) {
        stateRef.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 1,
          color,
        });
      }
      stateRef.current.particles.push({ x, y, vx: 0, vy: -1, life: 1.2, color, text, isText: true });
    }

    function drawStampIcon(x, y, size, item) {
      const info = ITEM_TYPES[item.type];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(item.rotation);
      // body
      ctx.fillStyle = info.color;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      const r = size * 0.15;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      // perforated edge dots
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const dots = 6;
      for (let i = 0; i <= dots; i++) {
        const t = i / dots - 0.5;
        ctx.beginPath(); ctx.arc(t * size, -size / 2, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(t * size, size / 2, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(-size / 2, t * size, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(size / 2, t * size, 2, 0, 7); ctx.fill();
      }
      // emoji
      ctx.font = `${size * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(info.emoji, 0, 2);
      ctx.restore();
    }

    function loop(now) {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const s = stateRef.current;

      // background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#dff0e4');
      grad.addColorStop(1, '#f5f0e6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (s.running) {
        s.timeLeft -= dt / 1000;
        if (s.timeLeft <= 0) {
          s.timeLeft = 0;
          s.running = false;
          setPhase('over');
        }

        s.lastSpawn += dt;
        if (s.lastSpawn > s.spawnInterval) {
          spawnItem();
          s.lastSpawn = 0;
          s.spawnInterval = Math.max(450, 1200 - s.score * 1.5);
        }

        // keyboard control
        if (keys['ArrowLeft']) basketXRef.current = Math.max(0.06, basketXRef.current - dt * 0.0012);
        if (keys['ArrowRight']) basketXRef.current = Math.min(0.94, basketXRef.current + dt * 0.0012);

        const basketY = height - 46;
        const basketW = 90;
        const basketPx = basketXRef.current * width;

        s.items.forEach((item) => {
          item.y += item.speed * dt * height * 0.06;
          item.rotation += item.rotSpeed;
        });

        // collision + offscreen
        s.items = s.items.filter((item) => {
          const px = item.x * width;
          const py = item.y * height;
          if (py > height + 20) {
            if (item.type !== 'bomb') s.combo = 1;
            return false;
          }
          if (py > basketY - 20 && py < basketY + 20 && Math.abs(px - basketPx) < basketW / 2 + 16) {
            const info = ITEM_TYPES[item.type];
            if (item.type === 'bomb') {
              s.lives -= 1;
              s.combo = 1;
              burst(px, py, '#cc3333', '💥');
              if (s.lives <= 0) {
                s.running = false;
                setPhase('over');
              }
            } else {
              const pts = Math.round(info.points * s.combo);
              s.score += pts;
              s.combo = Math.min(3, s.combo + 0.1);
              burst(px, py, info.color, `+${pts}`);
            }
            return false;
          }
          return true;
        });

        setUiScore(s.score);
        setUiLives(s.lives);
        setUiTime(Math.ceil(s.timeLeft));
        setUiCombo(Math.round(s.combo * 10) / 10);

        // draw items
        s.items.forEach((item) => drawStampIcon(item.x * width, item.y * height, 44, item));

        // draw basket
        ctx.save();
        ctx.translate(basketPx, basketY);
        ctx.fillStyle = '#1b3a2b';
        ctx.beginPath();
        ctx.roundRect(-basketW / 2, -14, basketW, 28, 10);
        ctx.fill();
        ctx.fillStyle = '#d4af37';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧺', 0, 8);
        ctx.restore();
      }

      // particles
      const s2 = stateRef.current;
      s2.particles = s2.particles.filter((p) => p.life > 0);
      s2.particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= dt / 600;
        ctx.globalAlpha = Math.max(0, p.life);
        if (p.isText) {
          ctx.font = 'bold 18px sans-serif';
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });

      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const startGame = () => {
    stateRef.current = {
      items: [], particles: [], score: 0, lives: 3, combo: 1,
      timeLeft: GAME_DURATION, lastSpawn: 0, spawnInterval: 1200, running: true,
    };
    setUiScore(0); setUiLives(3); setUiTime(GAME_DURATION); setUiCombo(1);
    setPhase('playing');
  };

  const claimCredits = async () => {
    const earned = Math.floor(stateRef.current.score / 2);
    setClaiming(true);
    try {
      const res = await fetch('/api/game/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ earned }),
      });
      const data = await res.json();
      setCredits(data.credits);
      setClaimedCredits(data.earned);
      setPhase('claimed');
    } catch {
      /* ignore */
    }
    setClaiming(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e6] py-10">
      <div className="container-page max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Mini Game</p>
            <h1 className="mt-1 text-3xl font-serif text-forest-900">Stamp Rush 🏃‍♂️📮</h1>
          </div>
          {loggedIn && credits !== null && (
            <div className="text-right">
              <p className="text-xs text-forest-700/60">Your Credits</p>
              <p className="text-2xl font-bold text-gold-600">{credits}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-forest-700/70 mb-4">
          Catch falling stamps 📮 and golden stamps ⭐ with your basket. Avoid bombs 💣! Move with your mouse, finger, or arrow keys.
          Score converts to <strong>Collector Credits</strong> — redeem them for a discount at checkout (up to 10% off).
        </p>

        <div className="relative rounded-2xl overflow-hidden border-4 border-forest-800 shadow-lg bg-white">
          <canvas ref={canvasRef} className="w-full block touch-none" style={{ height: 420 }} />

          {/* HUD */}
          {phase === 'playing' && (
            <div className="absolute top-3 left-3 right-3 flex justify-between text-sm font-bold">
              <span className="bg-forest-900/80 text-gold-300 px-3 py-1 rounded-full">Score: {uiScore}</span>
              <span className="bg-forest-900/80 text-gold-300 px-3 py-1 rounded-full">x{uiCombo} combo</span>
              <span className="bg-forest-900/80 text-red-300 px-3 py-1 rounded-full">
                {'❤️'.repeat(uiLives)}{'🖤'.repeat(3 - uiLives)}
              </span>
              <span className="bg-forest-900/80 text-gold-300 px-3 py-1 rounded-full">⏱ {uiTime}s</span>
            </div>
          )}

          {/* Start screen */}
          {phase === 'start' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-900/70 text-center px-6">
              <h2 className="text-3xl font-serif text-gold-300 mb-3">Ready to collect?</h2>
              <p className="text-cream-100 mb-6 max-w-sm">60 seconds. 3 lives. Catch as many stamps as you can!</p>
              {loggedIn ? (
                <button onClick={startGame} className="bg-gold-500 text-forest-900 font-bold px-8 py-3 rounded-full hover:bg-gold-400 transition">
                  Start Game
                </button>
              ) : (
                <p className="text-sm text-gold-200">
                  <Link to="/login" className="underline font-semibold">Log in</Link> to play and earn credits!
                </p>
              )}
            </div>
          )}

          {/* Game over screen */}
          {(phase === 'over' || phase === 'claimed') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-900/85 text-center px-6">
              <h2 className="text-3xl font-serif text-gold-300 mb-2">
                {uiLives <= 0 ? 'Game Over!' : "Time's Up!"}
              </h2>
              <p className="text-cream-100 text-lg mb-1">Final Score: <strong>{uiScore}</strong></p>
              {phase === 'over' && loggedIn && (
                <>
                  <p className="text-sm text-gold-200 mb-4">You earned {Math.floor(uiScore / 2)} Collector Credits!</p>
                  <button
                    onClick={claimCredits}
                    disabled={claiming}
                    className="bg-gold-500 text-forest-900 font-bold px-8 py-3 rounded-full hover:bg-gold-400 transition disabled:opacity-60 mb-3"
                  >
                    {claiming ? 'Claiming...' : 'Claim Credits'}
                  </button>
                </>
              )}
              {phase === 'claimed' && (
                <p className="text-green-300 font-semibold mb-4">+{claimedCredits} credits added! Total: {credits}</p>
              )}
              <div className="flex gap-3">
                <button onClick={startGame} className="border border-gold-400 text-gold-300 px-6 py-2 rounded-full hover:bg-gold-400/10 transition">
                  Play Again
                </button>
                <Link to="/marketplace" className="border border-gold-400 text-gold-300 px-6 py-2 rounded-full hover:bg-gold-400/10 transition">
                  Shop Stamps
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}