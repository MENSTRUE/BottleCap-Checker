import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, AlertCircle, ArrowDownToLine, ArrowRight, BarChart3, Beaker, CheckCircle2, ChevronRight, CircleHelp, FileJson, FileSearch, FlaskConical, Gauge, Github, Info, Layers3, LayoutDashboard, PackageCheck, RefreshCw, ScanLine, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { DetectionTable } from './components/DetectionTable';
import { ImageWorkspace } from './components/ImageWorkspace';
import { StatCard } from './components/StatCard';
import { getHealth, getModel, predict } from './services/api';
import { CLASSES, type Health, type ModelInfo, type Prediction, type ResearchMetrics } from './types/api';

type Page = 'overview' | 'inspection' | 'research';
const documentedMetrics: ResearchMetrics = { precision: .9002763692809642, recall: .93376881996345, map50: .9521119919493113, map50_95: .7598204984886472 };
const study = [
  { label: 'Train', count: 398, width: 100 },
  { label: 'Validation', count: 113, width: 28.4 },
  { label: 'Held-out test', count: 112, width: 28.1 },
];
function saveText(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function saveAnnotated(base64: string) {
  const anchor = document.createElement('a');
  anchor.href = `data:image/jpeg;base64,${base64}`;
  anchor.download = 'bottlecap_inspection_annotated.jpg';
  anchor.click();
}
function pct(value: number | undefined) { return value == null ? '—' : `${(value * 100).toFixed(2)}%`; }
function App() {
  const [page, setPage] = useState<Page>('inspection');
  const [health, setHealth] = useState<Health | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(.25);
  const [iou, setIou] = useState(.45);
  const [working, setWorking] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    setChecking(true);
    const responses = await Promise.allSettled([getHealth(), getModel()]);
    setHealth(responses[0].status === 'fulfilled' ? responses[0].value : null);
    setModel(responses[1].status === 'fulfilled' ? responses[1].value : null);
    setChecking(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (!file) { setPreview(null); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  function selectFile(image: File | null) {
    activeRequest.current?.abort(); setWorking(false); setError(''); setResult(null);
    if (image && (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 10 * 1024 * 1024 || image.size === 0)) {
      setFile(null); setError('Please choose a non-empty JPEG, PNG or WebP image up to 10 MiB.'); return;
    }
    setFile(image);
  }
  async function run() {
    if (!file || working) return;
    const controller = new AbortController(); activeRequest.current = controller;
    setWorking(true); setError(''); setResult(null);
    try { const response = await predict(file, confidence, iou, controller.signal); if (!controller.signal.aborted) setResult(response); }
    catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'An unexpected error occurred'); }
    finally { if (activeRequest.current === controller) { setWorking(false); activeRequest.current = null; } }
  }
  function changeThreshold(next: number, kind: 'confidence' | 'iou') {
    activeRequest.current?.abort(); setWorking(false); setResult(null); setError('');
    if (kind === 'confidence') setConfidence(next); else setIou(next);
  }
  const foundClasses = result ? CLASSES.filter(name => result.class_counts[name] > 0).length : null;
  const metrics = model?.heldout_test ?? documentedMetrics;
  const online = health?.status === 'ok';
  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="brand"><div className="brand-icon"><PackageCheck size={24}/></div><div className="brand-copy"><strong>BottleCap<span> Checker</span></strong><small>VISUAL QUALITY INTELLIGENCE</small></div></div>
        <div className="nav-label">WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">
          <button className={page === 'overview' ? 'active' : ''} onClick={() => setPage('overview')}><LayoutDashboard size={17}/> Overview</button>
          <button className={page === 'inspection' ? 'active' : ''} onClick={() => setPage('inspection')}><ScanLine size={17}/> AI Inspection <span className="live-label">LIVE</span></button>
          <button className={page === 'research' ? 'active' : ''} onClick={() => setPage('research')}><BarChart3 size={17}/> Model Insights</button>
        </nav>
        <div className="nav-label nav-label-second">RESEARCH PIPELINE</div><div className="pipeline-link"><Layers3 size={16}/> YOLOv8n / 5 classes</div><div className="pipeline-link dim"><Beaker size={16}/> Held-out evaluation</div>
        <div className="sidebar-bottom"><div className={`system-box ${online ? 'system-online' : ''}`}><div className="system-title"><i/> SYSTEM STATUS</div><strong>{online ? 'API Connected' : 'API Offline'}</strong><span>{health?.model_present ? 'Checkpoint available' : 'Check FastAPI / model path'}</span><button onClick={() => void refresh()} disabled={checking}>Refresh status <RefreshCw size={12} className={checking ? 'spin' : ''}/></button></div><div className="sidebar-footer"><span>BC</span><div><strong>BottleCap Checker</strong><small>Day 23 · Research prototype</small></div><small>v0.3</small></div></div>
      </aside>
      <div className="main-area"><header className="topbar"><span>WORKSPACE <span className="crumb-slash">/</span> <strong>{page === 'inspection' ? 'AI Inspection' : page === 'overview' ? 'Overview' : 'Model Insights'}</strong></span><div className="topbar-right"><span className={`status-badge ${online ? 'online' : 'offline'}`}>{online ? 'API Online' : 'API Offline'}</span><span className="avatar">BC</span></div></header>
        <main className="content"><div className="heading-row"><div><div className="eyebrow"><Activity size={14}/> INDUSTRIAL VISUAL INSPECTION</div><h1>{page === 'inspection' ? 'Bottle Cap Inspection' : page === 'overview' ? 'Quality Intelligence Overview' : 'Research & Model Insights'}<span className="heading-accent">.</span></h1><p>Evidence-first bottle-cap inspection powered by a real YOLOv8n research checkpoint.</p></div><div className="research-pill"><ShieldAlert size={14}/> Research Prototype <strong>DAY 23</strong></div></div>
          {page === 'inspection' && <>
            <div className="stats-grid"><StatCard label="Total detections" value={result ? String(result.detection_count) : '—'} detail="Boxes in current image" icon={<ScanLine size={17}/>} /><StatCard label="Distinct classes" value={result ? String(foundClasses) : '—'} detail="Predicted classes in image" icon={<Layers3 size={17}/>} /><StatCard label="Quality decision" value="Not assessed" detail="Human review is required" icon={<ShieldAlert size={17}/>} accent/><StatCard label="Inference time" value={result ? `${result.inference_ms.toFixed(1)} ms` : '—'} detail="Measured backend model call" icon={<Gauge size={17}/>} /></div>
            <div className="inspection-grid"><div><ImageWorkspace file={file} preview={preview} result={result} working={working} onImage={selectFile} onRun={() => void run()}/>{error && <div role="alert" className="error-box"><AlertCircle size={18}/>{error}</div>}</div><div className="right-stack"><section className="panel settings-panel"><div className="panel-heading"><h3><SlidersHorizontal size={17}/> Detection settings</h3></div>
              <div className="slider-head"><label htmlFor="conf-slider">Confidence threshold</label><strong>{confidence.toFixed(2)}</strong></div><input id="conf-slider" type="range" min="0.05" max="0.95" step="0.05" value={confidence} onChange={event => changeThreshold(Number(event.target.value), 'confidence')}/><div className="slider-notes"><span>More sensitive</span><span>More selective</span></div>
              <div className="slider-head second-slider"><label htmlFor="iou-slider">NMS IoU threshold</label><strong>{iou.toFixed(2)}</strong></div><input id="iou-slider" type="range" min="0.10" max="0.90" step="0.05" value={iou} onChange={event => changeThreshold(Number(event.target.value), 'iou')}/><div className="slider-notes"><span>More suppression</span><span>More overlap allowed</span></div>
              <div className="settings-note">Changing either threshold clears old results. Run inspection again.</div><div className="model-panel"><span>ACTIVE CHECKPOINT</span><strong>bottlecap_primary_best.pt</strong><small>5 classes · YOLOv8n</small><CheckCircle2 size={16}/></div>
            </section><section className="panel summary-panel"><div className="panel-heading"><h3><FileSearch size={17}/> Inspection summary</h3><span className="count-pill">{result?.detection_count ?? '—'}</span></div>
              {result ? <><div className="summary-badges"><span>{result.detection_count} detections</span><span className="human-tag">Human review</span></div><div className="class-summary">{CLASSES.filter(name => result.class_counts[name] > 0).map(name => <div key={name}><span>{name}</span><strong>{result.class_counts[name]}</strong></div>)}{result.detection_count === 0 && <p>No detections at selected thresholds. This does not establish a defect-free product.</p>}</div></> : <p className="summary-empty">Run inspection to see five-class model findings.</p>}
              <div className="warning-note"><ShieldAlert size={15}/> No automatic manufacturing pass/fail verdict is provided.</div>
            </section></div></div>
            <section className="results-container"><div className="export-actions"><button disabled={!result} onClick={() => result && saveText(JSON.stringify({...result, annotated_image_base64: undefined}, null, 2), 'bottlecap_inspection.json', 'application/json')}><FileJson size={15}/> Export JSON</button><button disabled={!result?.annotated_image_base64} onClick={() => result?.annotated_image_base64 && saveAnnotated(result.annotated_image_base64)}><ArrowDownToLine size={15}/> Download image</button></div><DetectionTable rows={result?.detections ?? []}/></section>
          </>}
          {page === 'overview' && <><div className="stats-grid"><StatCard label="Primary images" value="623" detail="Published source partitions" icon={<Layers3 size={18}/>} /><StatCard label="Held-out test" value="112" detail="Test images, not training" icon={<FileSearch size={18}/>} /><StatCard label="Classes" value="5" detail="Bottle cap conditions" icon={<PackageCheck size={18}/>} /><StatCard label="mAP@50" value={pct(metrics.map50)} detail="Static held-out research metric" icon={<BarChart3 size={18}/>} /></div><div className="two-panels"><section className="panel content-panel"><div className="panel-heading"><h3><FlaskConical size={18}/> Project overview</h3></div><h2>From research to a working inspection dashboard.</h2><p>BottleCap Checker runs a trained YOLOv8n object detector for five labeled cap conditions. The app returns bounding boxes, confidence values, and evidence for human review.</p><div className="step-list"><div><CheckCircle2 size={17}/> Dataset audit & exact-hash review</div><div><CheckCircle2 size={17}/> Validation-selected YOLO checkpoint</div><div><CheckCircle2 size={17}/> Held-out 112-image test</div><div><CheckCircle2 size={17}/> FastAPI + React inference interface</div></div><button className="primary-button" onClick={() => setPage('inspection')}>Open inspection <ArrowRight size={16}/></button></section><section className="panel content-panel"><div className="panel-heading"><h3><BarChart3 size={18}/> Dataset split</h3></div><p>Primary dataset · Bottle Defects v28</p><div className="dataset-bars">{study.map(item => <div className="dataset-row" key={item.label}><div><span>{item.label}</span><strong>{item.count}</strong></div><span className="dataset-track"><i style={{width: `${item.width}%`}}/></span></div>)}</div><div className="warning-note"><Info size={15}/> Filename-family and exact-hash audits passed; near-duplicates may still remain.</div></section></div></>}
          {page === 'research' && <><div className="stats-grid"><StatCard label="Precision" value={pct(metrics.precision)} detail="Held-out test" icon={<Gauge size={17}/>} /><StatCard label="Recall" value={pct(metrics.recall)} detail="Held-out test" icon={<Activity size={17}/>} /><StatCard label="mAP@50" value={pct(metrics.map50)} detail="Held-out test" icon={<BarChart3 size={17}/>} /><StatCard label="mAP@50–95" value={pct(metrics.map50_95)} detail="Held-out test" icon={<Layers3 size={17}/>} /></div><div className="two-panels"><section className="panel content-panel"><div className="panel-heading"><h3><BarChart3 size={18}/> Per-class AP@50–95</h3><span className="outline-tag">TEST · N=112</span></div><p>From saved Kaggle research results, not calculated by the browser.</p><div className="dataset-bars">{CLASSES.map(name => {const fallback: Record<string,number>={'Broken Cap':.7439461151828267,'Broken Ring':.37346104111723655,'Good Cap':.9136948051948053,'Loose Cap':.824688906298508,'No Cap':.94331162464986};const score = metrics.per_class_map50_95?.[name] ?? fallback[name];return <div className="dataset-row" key={name}><div><span>{name}</span><strong>{pct(score)}</strong></div><span className="dataset-track"><i style={{width:`${score*100}%`}}/></span></div>;})}</div><div className="warning-note"><AlertCircle size={15}/> Broken Ring localization is weaker at stricter IoU thresholds.</div></section><section className="panel content-panel"><div className="panel-heading"><h3><FlaskConical size={18}/> Methodology & boundaries</h3></div><div className="method-list"><div><span>MODEL</span><strong>YOLOv8n · pretrained</strong></div><div><span>DATA</span><strong>Bottle Defects v28</strong></div><div><span>CONFIG</span><strong>640 px · seed 42 · 65 max epochs</strong></div><div><span>SELECTION</span><strong>Validation best.pt only</strong></div><div><span>FINAL TEST</span><strong>112 held-out images</strong></div><div><span>SECONDARY DATA</span><strong>Audited, excluded from training</strong></div></div><p className="research-disclaimer">These metrics describe performance on the provided dataset, not live factory reliability. Results require human review. No pass/fail policy has been validated.</p><a className="repo-link" href="https://github.com/MENSTRUE/BottleCap-Checker" target="_blank" rel="noreferrer"><Github size={16}/> Research repository <ChevronRight size={16}/></a></section></div></>}
          <footer className="footer"><CircleHelp size={13}/> BottleCap Checker · Day 23 / 100 · Research prototype — no automated product release decisions.</footer>
        </main>
      </div>
    </div>
  );
}
export default App;
