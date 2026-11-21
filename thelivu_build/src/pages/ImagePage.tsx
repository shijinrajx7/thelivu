import { useEffect, useState, type ChangeEvent } from 'react';
import { Camera, Eraser, ExternalLink, Image as ImageIcon, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { parse } from 'exifr';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import type { Finding, ScanRecord } from '../lib/types';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now());
interface Metadata { width: number; height: number; hasExif: boolean; camera?: string; capturedAt?: string; hasGps: boolean; }
export function ImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [record, setRecord] = useState<ScanRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  useEffect(() => {
    if (!file) { setPreview(''); setMetadata(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl); setBusy(true); setRecord(null);
    let active = true;
    const image = new window.Image();
    image.onload = async () => {
      let exif: Record<string, unknown> | undefined;
      try { exif = await parse(file) as Record<string, unknown> | undefined; } catch { exif = undefined; }
      if (!active) return;
      setMetadata({ width: image.naturalWidth, height: image.naturalHeight, hasExif: Boolean(exif && Object.keys(exif).length), camera: exif?.Model ? String(exif.Model) : exif?.Make ? String(exif.Make) : undefined, capturedAt: exif?.DateTimeOriginal ? String(exif.DateTimeOriginal) : undefined, hasGps: Boolean(exif?.latitude || exif?.GPSLatitude) });
      setBusy(false);
    };
    image.onerror = () => { if (active) { setBusy(false); notify('This image could not be decoded in the browser.', 'error'); } };
    image.src = objectUrl;
    return () => { active = false; URL.revokeObjectURL(objectUrl); };
  }, [file, notify]);
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) { notify('Choose an image file.', 'error'); return; }
    if (selected.size > 20 * 1024 * 1024) { notify('Choose an image smaller than 20 MB.', 'error'); return; }
    setFile(selected); event.target.value = '';
  };
  const clear = () => { setFile(null); setRecord(null); setMetadata(null); setPreview(''); notify('Image selection cleared from this page.'); };
  const analyze = () => {
    if (!file || !metadata) { notify('Select an image and wait for local metadata inspection.', 'info'); return; }
    const findings: Finding[] = [
      { id: makeId(), title: 'Image dimensions', detail: `${metadata.width} × ${metadata.height} pixels. Dimensions describe the file and do not identify its origin.`, severity: 'info', evidence: `${metadata.width}×${metadata.height}`, source: 'Browser image decoder' },
      { id: makeId(), title: metadata.hasExif ? 'EXIF metadata found' : 'No readable EXIF metadata', detail: metadata.hasExif ? 'Some metadata is present. Metadata can be edited and is not proof of authenticity.' : 'No EXIF metadata was readable. Many valid images have no metadata; its absence does not prove manipulation.', severity: 'info', source: 'Local EXIF parser' },
    ];
    if (metadata.hasGps) findings.push({ id: makeId(), title: 'Location metadata present', detail: 'This file appears to contain GPS metadata. Exact coordinates are not shown or stored; remove metadata before sharing if location privacy matters.', severity: 'medium', source: 'Local EXIF parser' });
    if (metadata.camera) findings.push({ id: makeId(), title: 'Camera/device label present', detail: `A device label (${metadata.camera}) is present. Such fields can be altered and are not proof that a camera captured the image.`, severity: 'info', source: 'Local EXIF parser' });
    const next: ScanRecord = { id: makeId(), type: 'image', label: `Image metadata · ${file.type || 'unknown type'} · ${(file.size / 1024).toFixed(0)} KB`, assessment: 'Inconclusive', summary: 'Local metadata inspection only; no image manipulation or AI-generation detector ran.', checkedAt: new Date().toISOString(), findings, coverage: ['File bytes were not uploaded or persisted', 'Dimensions read by browser', 'Readable EXIF tags summarized locally', 'Reverse-image search not performed', 'Manipulation/AI detection not configured'] };
    setRecord(next); saveHistory(next); announceDataChange();
  };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><ImageIcon /> Local media inspection</span><h1>Image Verification</h1><p>Inspect a selected image's file details and readable metadata. Metadata presence or absence does not establish authenticity.</p></div><span className="badge badge-success"><ShieldCheck size={11} /> Stays in this browser</span></div>
    <div className="grid grid-2"><section className="panel panel-pad stack"><div className="panel-head"><div><h2>Choose an image</h2><p>Supported formats depend on this browser; maximum file size 20 MB.</p></div></div><label className="file-drop" htmlFor="image-file"><Upload /><strong>{file ? file.name : 'Select an image to inspect'}</strong><p>{file ? `${(file.size / 1024).toFixed(1)} KB · ${file.type || 'unknown type'}` : 'Preview and metadata analysis run locally.'}<br />No upload or server storage.</p><input id="image-file" type="file" accept="image/*" onChange={choose} /></label>{file && <div className="row"><button className="button button-primary" disabled={busy || !metadata} onClick={analyze}><Camera /> Inspect metadata</button><button className="button button-secondary" onClick={clear}><Eraser /> Remove image</button></div>}<div className="notice"><ShieldAlert /><span><strong>Not a forensic detector.</strong> Similar-image search, manipulation analysis, and AI-generation detection are not configured. Do not treat missing EXIF as proof of alteration.</span></div></section>
      <section className="panel panel-pad stack"><div className="panel-head"><div><h2>Preview & file information</h2><p>Temporary object URL is revoked when cleared or leaving this page.</p></div></div>{preview ? <><img className="preview-image" src={preview} alt="Selected image preview" />{metadata && <div className="grid grid-2"><div className="stat-card"><div><div className="stat-label">Dimensions</div><div className="stat-foot" style={{ color: 'var(--text)' }}>{metadata.width} × {metadata.height}px</div></div><span className="stat-icon"><ImageIcon /></span></div><div className="stat-card"><div><div className="stat-label">EXIF</div><div className="stat-foot" style={{ color: 'var(--text)' }}>{metadata.hasExif ? 'Readable tags found' : 'No readable tags'}</div></div><span className="stat-icon"><Camera /></span></div></div>}{metadata?.camera && <span className="badge badge-info">Device label present: {metadata.camera}</span>}{metadata?.capturedAt && <span className="badge">Capture time present: {metadata.capturedAt}</span>}{metadata?.hasGps && <span className="badge badge-warning">GPS metadata present (coordinates hidden)</span>}</> : <div className="empty-state"><ImageIcon /><strong>No image selected</strong><p>Choose a file to display a local preview and inspect its basic metadata.</p></div>}</section></div>
    {metadata && <div className="row-between panel panel-pad" style={{ flexWrap: 'wrap' }}><div><strong style={{ fontSize: 11 }}>Manual reverse-image search</strong><p className="muted-text small" style={{ margin: '4px 0 0' }}>Thelivu will not upload the image. Open a search site and choose manually whether to submit it.</p></div><a className="button button-secondary" href="https://images.google.com/" target="_blank" rel="noreferrer noopener">Open Google Images <ExternalLink size={13} /></a></div>}
    {record && <ResultPanel record={record} recommendations={['Keep an original file and compare it with an independently obtained source.', 'If location metadata matters, remove it before public sharing.', 'Use reverse-image search manually and review source dates and context.']} />}
  </div>;
}
