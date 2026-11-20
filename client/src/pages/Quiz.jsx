import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (!loggedIn) return;
    fetch('/api/game/quiz', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setStatus(data);
        setAnswers(new Array(data.questions.length).fill(null));
      })
      .catch(() => {});
  }, [loggedIn]);

  const selectAnswer = (optionIndex) => {
    const updated = [...answers];
    updated[current] = optionIndex;
    setAnswers(updated);
  };

  const next = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
    else submitQuiz(answers);
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/game/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not submit quiz.');
        setSubmitting(false);
        return;
      }
      setResult(data);
    } catch {
      setError('Could not connect to server.');
    }
    setSubmitting(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <p className="text-forest-700">
          <Link to="/login" className="underline font-semibold text-gold-600">Log in</Link> to play the Philately Quiz.
        </p>
      </div>
    );
  }

  if (!status) {
    return <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center text-forest-700">Loading quiz...</div>;
  }

  if (!status.canPlay && !result) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-forest-800/10 shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-serif text-forest-900 mb-3">Philately Quiz 🧠</h1>
          {status.activeVoucherPercent > 0 ? (
            <p className="text-green-700 font-semibold">You have an active {status.activeVoucherPercent}% off voucher — use it at checkout!</p>
          ) : (
            <p className="text-forest-700/70">Come back in 24 hours for your next attempt.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e6] py-10">
      <div className="container-page max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600 text-center">Daily Challenge</p>
        <h1 className="text-3xl font-serif text-forest-900 text-center mb-2">Philately Quiz 🧠</h1>
        <p className="text-sm text-forest-700/70 text-center mb-8">
          Answer all 5 correctly for 15% off. 4 correct = 10% off. 3 correct = 5% off.
        </p>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-4 py-2 mb-4">{error}</div>}

        {!result ? (
          <div className="bg-white rounded-2xl border border-forest-800/10 shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold text-forest-700/60 uppercase tracking-wide">
                Question {current + 1} of {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 w-6 rounded-full ${i <= current ? 'bg-forest-800' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            <h2 className="text-lg font-serif text-forest-900 mb-6">{questions[current].question}</h2>

            <div className="space-y-3 mb-8">
              {questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`w-full text-left px-5 py-3 rounded-xl border transition ${
                    answers[current] === i
                      ? 'border-gold-500 bg-gold-50 text-forest-900 font-semibold'
                      : 'border-forest-800/15 hover:bg-forest-800/5 text-forest-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              disabled={answers[current] === null || submitting}
              className="w-full bg-forest-800 text-gold-300 font-bold py-3 rounded-full hover:bg-forest-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : current < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-forest-800/10 shadow-lg p-8 text-center">
            <h2 className="text-2xl font-serif text-forest-900 mb-2">
              You scored {result.correctCount} / {result.total}
            </h2>
            {result.discountPercent > 0 ? (
              <p className="text-xl font-bold text-gold-600 mb-4">🎉 You earned {result.discountPercent}% OFF!</p>
            ) : (
              <p className="text-forest-700/70 mb-4">No discount this time — try again tomorrow!</p>
            )}
            <div className="flex justify-center gap-3">
              <Link to="/marketplace" className="bg-forest-800 text-gold-300 font-semibold px-6 py-2.5 rounded-full hover:bg-forest-700 transition">
                Shop Stamps
              </Link>
              <Link to="/spin" className="border border-forest-800 text-forest-800 font-semibold px-6 py-2.5 rounded-full hover:bg-forest-800/5 transition">
                Try the Wheel
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}