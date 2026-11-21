import { useEffect, useState } from 'react';
import { AudioLines, VolumeX } from 'lucide-react';

function playCompletionTone() {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [523, 784].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.09 + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.09);
      oscillator.stop(context.currentTime + index * 0.09 + 0.24);
    });
    window.setTimeout(() => void context.close(), 500);
  } catch { /* audio is optional */ }
}

export function Intro({ onComplete }: { onComplete: () => void }) {
  const [sound, setSound] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => { try { sessionStorage.setItem('thelivu.intro.seen', '1'); } catch { /* storage optional */ } onComplete(); }, reduced ? 400 : 3400);
    return () => window.clearTimeout(timer);
  }, [onComplete]);
  const finish = () => {
    try { sessionStorage.setItem('thelivu.intro.seen', '1'); } catch { /* storage optional */ }
    if (sound) playCompletionTone();
    onComplete();
  };
  return (
    <div className="intro-screen" role="dialog" aria-label="Thelivu introduction">
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />
      <div className="intro-content">
        <div className="intro-emblem" aria-hidden="true">
          <span className="intro-orbit" />
          <img src="/thelivu-shield.svg" alt="" />
          <span className="intro-scan" />
        </div>
        <h1 className="intro-name">THELIVU</h1>
        <p className="intro-tagline">VERIFY BEFORE YOU TRUST.</p>
        <div className="intro-loader"><span className="loader-dots"><span /><span /><span /></span><span>Preparing your trust centre</span></div>
      </div>
      <div className="intro-controls">
        <span className="intro-link" aria-live="polite">Privacy-first checks. No site is opened.</span>
        <div className="intro-control-group">
          <button className="intro-link" type="button" aria-pressed={sound} onClick={() => setSound((value) => !value)}>
            {sound ? <AudioLines size={13} /> : <VolumeX size={13} />} Sound {sound ? 'on' : 'off'}
          </button>
          <button className="intro-link" type="button" onClick={finish}>Skip introduction</button>
        </div>
      </div>
    </div>
  );
}
