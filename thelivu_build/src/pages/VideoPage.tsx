import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Clapperboard, Eraser, Frame, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import type { Finding, ScanRecord } from '../lib/types';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now());
export function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState('');
  const [frameTime, setFrameTime] = useState('0');
  const [frameUrl, setFrameUrl] = useState('');
  const [record, setRecord] = useState<ScanRecord | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { notify } = useToast();
  useEffect(() => {
    if (!file) { setVideoUrl(''); setDuration(0); setDimensions(''); return; }
    const url = URL.createObjectURL(file); setVideoUrl(url); setFrameUrl(''); setRecord(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]; if (!selected) return;
    if (!selected.type.startsWith('video/')) { notify('Choose a video file supported by your browser.', 'error'); return; }
    if (selected.size > 60 * 1024 * 1024) { notify('Choose a video smaller than 60 MB.', 'error'); return; }
    setFile(selected); event.target.value = '';
  };
  const captureFrame = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas || !Number.isFinite(video.duration)) { notify('Wait for video metadata to load.', 'info'); return; }
    const requested = Number(frameTime);
    if (!Number.isFinite(requested) || requested < 0 || requested > video.duration) { notify('Choose a frame time within the video duration.', 'error'); return; }
    const draw = () => {
      try {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setFrameUrl(canvas.toDataURL('image/jpeg', .82));
      } catch { notify('The browser could not capture this frame.', 'error'); }
    };
    if (Math.abs(video.currentTime - requested) < .05) {
      if (video.readyState >= 2) { draw(); return; }
      const onLoadedData = () => { video.removeEventListener('loadeddata', onLoadedData); draw(); };
      video.addEventListener('loadeddata', onLoadedData, { once: true });
      return;
    }
    const onSeeked = () => { video.removeEventListener('seeked', onSeeked); draw(); };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = requested;
  };
  const analyze = () => {
    if (!file || !duration) { notify('Select a video and wait for local metadata inspection.', 'info'); return; }
    const findings: Finding[] = [{ id: makeId(), title: 'Local video metadata', detail: `Duration ${duration.toFixed(1)} seconds${dimensions ? `; dimensions ${dimensions}` : ''}. Metadata describes the file container, not the truth of its contents.`, severity: 'info', evidence: `${file.type || 'unknown type'} · ${(file.size / 1024 / 1024).toFixed(2)} MB`, source: 'Browser video decoder' }];
    if (frameUrl) findings.push({ id: makeId(), title: 'Selected frame captured', detail: `A still at approximately ${Number(frameTime).toFixed(1)} seconds was captured in memory for manual review. It was not uploaded or persisted.`, severity: 'info', evidence: `${dimensions || 'Frame dimensions unavailable'}`, source: 'Local HTML video/canvas' });
    const next: ScanRecord = { id: makeId(), type: 'video', label: `Video metadata · ${file.type || 'unknown type'} · ${(file.size / 1024 / 1024).toFixed(1)} MB`, assessment: 'Inconclusive', summary: 'Container metadata and optional frame only; no deepfake or forensic detector ran.', checkedAt: new Date().toISOString(), findings, coverage: ['Video file remained in this browser', 'Duration/dimensions read when supported', 'Selected frame is for manual inspection only', 'Audio/video consistency not analyzed', 'Deepfake detection not configured'] };
    setRecord(next); saveHistory(next); announceDataChange();
  };
  const clear = () => { setFile(null); setRecord(null); setFrameUrl(''); notify('Video selection and captured frame cleared.'); };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><Clapperboard /> Local video awareness</span><h1>Video Analysis</h1><p>Inspect browser-readable file details and a selected frame. These checks cannot determine whether a video is authentic.</p></div><span className="badge badge-success"><ShieldCheck size={11} /> Not uploaded</span></div>
    <div className="grid grid-2"><section className="panel panel-pad stack"><div className="panel-head"><div><h2>Choose a video</h2><p>Maximum 60 MB. Playback and metadata are local to this browser.</p></div></div><label className="file-drop" htmlFor="video-file"><Upload /><strong>{file ? file.name : 'Select a video file'}</strong><p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ${file.type || 'unknown type'}` : 'Common browser-supported video formats.'}<br />No upload or persistent storage.</p><input id="video-file" type="file" accept="video/*" onChange={choose} /></label>{file && <button className="button button-secondary" onClick={clear}><Eraser /> Remove video</button>}<div className="notice warning"><ShieldAlert /><span><strong>Deepfake limitations:</strong> no supported forensic or audio/video consistency detector is configured. A normal-looking file or frame does not prove authenticity.</span></div></section>
      <section className="panel panel-pad stack"><div className="panel-head"><div><h2>Video preview</h2><p>Metadata is read from the browser media element.</p></div></div>{videoUrl ? <><video className="video-preview" ref={videoRef} src={videoUrl} controls preload="metadata" onLoadedMetadata={(event) => { const video = event.currentTarget; setDuration(video.duration); setDimensions(`${video.videoWidth} × ${video.videoHeight}`); }} onError={() => notify('This video format could not be decoded by the browser.', 'error')} />{duration > 0 && <div className="grid grid-2"><div className="stat-card"><div><div className="stat-label">Duration</div><div className="stat-foot" style={{ color: 'var(--text)' }}>{duration.toFixed(1)} sec</div></div><span className="stat-icon"><Clapperboard /></span></div><div className="stat-card"><div><div className="stat-label">Resolution</div><div className="stat-foot" style={{ color: 'var(--text)' }}>{dimensions || 'Not reported'}</div></div><span className="stat-icon"><Frame /></span></div></div>}{duration > 0 && <div className="stack-sm"><label className="field-label" htmlFor="frame-time">Selected frame time in seconds</label><div className="form-row"><input className="input" id="frame-time" type="number" min="0" max={duration} step="0.1" value={frameTime} onChange={(event) => setFrameTime(event.target.value)} /><button className="button button-secondary" onClick={captureFrame}><Frame /> Capture frame</button><button className="button button-primary" onClick={analyze}><ShieldCheck /> Create report</button></div></div>}{frameUrl && <div className="stack-sm"><strong style={{ fontSize: 11 }}>Selected frame preview</strong><img className="captured-frame" src={frameUrl} alt={`Selected video frame at ${frameTime} seconds`} /></div>}<canvas ref={canvasRef} style={{ display: 'none' }} /></> : <div className="empty-state"><Clapperboard /><strong>No video selected</strong><p>Select a supported clip to inspect duration and dimensions locally.</p></div>}</section></div>
    {record && <ResultPanel record={record} recommendations={['Compare with the original source and check whether dates, location, and speaker context match.', 'Seek independent reporting or the speaker’s official channel for corroboration.', 'Treat visual or acoustic impressions as clues, not proof of authenticity.']} />}
  </div>;
}
