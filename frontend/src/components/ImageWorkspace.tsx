import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { ArrowRight, FileImage, RefreshCw, ScanLine, UploadCloud, X } from 'lucide-react';
import type { Prediction } from '../types/api';

type Props = {
  file: File | null; preview: string | null; result: Prediction | null;
  working: boolean; onImage: (file: File | null) => void; onRun: () => void;
};
export function ImageWorkspace({ file, preview, result, working, onImage, onRun }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [display, setDisplay] = useState<'annotated' | 'original'>('annotated');
  function setFile(value?: File) { if (value) { onImage(value); setDisplay('annotated'); } }
  function onDrop(event: DragEvent) { event.preventDefault(); setDrag(false); setFile(event.dataTransfer.files[0]); }
  function onChange(event: ChangeEvent<HTMLInputElement>) { setFile(event.target.files?.[0]); event.target.value = ''; }
  const annotated = result?.annotated_image_base64 ? `data:image/jpeg;base64,${result.annotated_image_base64}` : null;
  const visibleImage = display === 'annotated' && annotated ? annotated : preview;
  return (
    <section className="panel workspace-panel">
      <div className="panel-heading"><div><h3><ScanLine size={17}/> Inspection workspace</h3><p>Upload a bottle-cap photograph for model inference</p></div><span className="outline-tag">OBJECT DETECTION</span></div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onChange}/>
      {!file ? <div role="button" tabIndex={0} className={`dropzone ${drag ? 'is-dragged' : ''}`} onDragEnter={e => {e.preventDefault();setDrag(true);}} onDragOver={e => e.preventDefault()} onDragLeave={e => {e.preventDefault();setDrag(false);}} onDrop={onDrop} onKeyDown={e => {if (e.key === 'Enter' || e.key === ' ') input.current?.click();}} onClick={() => input.current?.click()}>
        <span className="upload-emblem"><UploadCloud size={34}/></span><h3>Upload inspection image</h3><p>Drag and drop a product photo, or browse your device.</p>
        <span className="choose-button">Choose image <ArrowRight size={15}/></span><small>JPEG · PNG · WebP · Maximum 10 MiB</small>
      </div> : <div className="image-box">
        <div className="image-toolbar"><div className="image-toggle"><button className={display === 'original' ? 'selected' : ''} onClick={() => setDisplay('original')}>Original</button><button className={display === 'annotated' ? 'selected' : ''} disabled={!annotated} onClick={() => setDisplay('annotated')}>Annotated</button></div>
          <div className="image-actions"><button onClick={() => input.current?.click()}><RefreshCw size={13}/> Replace</button><button title="Remove image" aria-label="Remove image" onClick={() => onImage(null)}><X size={15}/></button></div></div>
        <div className="image-canvas">{visibleImage ? <img src={visibleImage} alt={display === 'annotated' && annotated ? 'Model-detected defects with bounding boxes' : 'Original uploaded bottle cap'}/> : <FileImage size={28}/>}</div>
        <div className="image-meta"><span><FileImage size={13}/>{file.name}</span><span>{(file.size / 1048576).toFixed(2)} MiB</span></div>
      </div>}
      <div className="workspace-footer"><span className="hint"><ScanLine size={15}/> Visual research observations only. Human review is required.</span>
        <button className="primary-button" disabled={!file || working} onClick={onRun}>{working ? 'Inspecting…' : 'Run inspection'}{working ? <RefreshCw className="spin" size={16}/> : <ArrowRight size={16}/>}</button></div>
    </section>
  );
}
