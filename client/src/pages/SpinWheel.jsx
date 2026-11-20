import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../utils/auth';

const SEGMENTS = [
  { percent: 5, label: '5% OFF', color: '#d4af37' },
  { percent: 0, label: 'Try Again', color: '#1b3a2b' },
  { percent: 10, label: '10% OFF', color: '#c9972e' },
  { percent: 0, label: 'Try Again', color: '#2f6b4f' },
  { percent: 5, label: '5% OFF', color: '#d4af37' },
  { percent: 0, label: 'Try Again', color: '#1b3a2b' },
  { percent: 15, label: '15% OFF', color: '#b8860b' },
  { percent: 0, label: 'Try Again', color: '#2f6b4f' },
];

export default function SpinWheel() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const loggedIn = Boolean(getToken());
  const segAngle = 360 / SEGMENTS.length;

  useEffect(() => {
    if (!loggedIn) return;
    fetch('/api/game/spin-status', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, [loggedIn]);

  useEffect(() => {
    drawWheel();
  }, []);

  function drawWheel() {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);
    SEGMENTS.forEach((seg, i) => {
      const startAngle = (i * segAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#f5e6a8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + (endAngle - startAngle) / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#f5f0e6';
      ctx.font = 'bold 15px serif';
      ctx.fillText(seg.label, radius - 14, 5);
      ctx.restore();
    });

    // center hub
    ctx.beginPath();
    ctx.arc(center, center, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#f5e6a8';
    ctx.fill();
    ctx.strokeStyle = '#1b3a2b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1b3a2b';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('P', center, center + 8);
  }

  const spin = async () => {
    if (spinning) return;
    setError('');
    setResult(null);
    setSpinning(true);
    try {
      const res = await fetch('/api/game/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not spin.');
        setSpinning(false);
        return;
      }

      const targetSegmentCenter = data.segmentIndex * segAngle + segAngle / 2;
      // Spin several full turns, landing so the pointer (fixed at top) points at the chosen segment.
      const fullSpins = 5 * 360;
      const finalRotation = fullSpins + (360 - targetSegmentCenter);

      setRotation((prev) => prev + finalRotation);

      setTimeout(() => {
        setResult(data);
        setSpinning(false);
        setStatus((s) => ({ ...s, canSpin: false, activeVoucherPercent: data.discountPercent }));
      }, 4200);
    } catch {
      setError('Could not connect to server.');
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e6] py-10">
      <div className="container-page max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Daily Bonus</p>
        <h1 className="mt-1 text-3xl font-serif text-forest-900 mb-2">Spin the Collector's Wheel 🎡</h1>
        <p className="text-sm text-forest-700/70 mb-8">
          One free spin every 24 hours. Win up to 15% off your next order!
        </p>

        {!loggedIn ? (
          <p className="text-forest-700">
            <Link to="/login" className="underline font-semibold text-gold-600">Log in</Link> to spin the wheel.
          </p>
        ) : (
          <>
            <div className="relative inline-block mb-8">
              <div
                className="absolute left-1/2 -top-3 -translate-x-1/2 z-10"
                style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '22px solid #1b3a2b' }}
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-full border-8 border-forest-800 shadow-xl"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              />
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-4 py-2 mb-4">{error}</div>}

            {status && !status.canSpin && !result && (
              <p className="text-forest-700/70 mb-4 text-sm">
                {status.activeVoucherPercent > 0
                  ? `You have an active ${status.activeVoucherPercent}% off voucher — use it at checkout!`
                  : 'Come back in 24 hours for your next free spin.'}
              </p>
            )}

            {result && (
              <div className="mb-4">
                {result.discountPercent > 0 ? (
                  <p className="text-xl font-bold text-gold-600">🎉 You won {result.discountPercent}% OFF!</p>
                ) : (
                  <p className="text-xl font-bold text-forest-700">Better luck next time!</p>
                )}
              </div>
            )}
       <p className="text-sm text-forest-700/60 mb-4">
      Want better odds? Try the{' '}
     <Link to="/quiz" className="text-gold-600 font-semibold underline">Philately Quiz</Link> for a guaranteed discount.
        </p>

            <button
              onClick={spin}
              disabled={spinning || (status && !status.canSpin)}
              className="bg-forest-800 text-gold-300 font-bold px-10 py-3 rounded-full hover:bg-forest-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {spinning ? 'Spinning...' : status && !status.canSpin ? 'Come back tomorrow' : 'SPIN NOW'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}