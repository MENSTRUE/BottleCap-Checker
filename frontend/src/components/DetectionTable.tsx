import { useState } from 'react';
import { CLASSES, type Detection } from '../types/api';

type Props = { rows: Detection[] };
export function DetectionTable({ rows }: Props) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? rows : rows.filter(row => row.class_name === filter);
  return (
    <section className="panel results-panel">
      <div className="panel-heading"><div><h3>Detection results</h3><p>Predictions returned by your trained YOLOv8n checkpoint</p></div>
        <label className="filter-wrap"><span className="sr-only">Filter by class</span>
          <select value={filter} onChange={event => setFilter(event.target.value)}>
            <option value="all">All classes</option>
            {CLASSES.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </div>
      <div className="table-scroll"><table><thead><tr><th>NO.</th><th>PREDICTED CLASS</th><th>CONFIDENCE</th><th>BOUNDING BOX (XYXY)</th></tr></thead>
        <tbody>{filtered.length ? filtered.map((det, index) => <tr key={`${det.class_id}-${index}`}>
          <td>{String(index + 1).padStart(2, '0')}</td>
          <td><span className={`class-chip class-${det.class_id}`}>{det.class_name}</span></td>
          <td><div className="confidence-cell"><span>{(det.confidence * 100).toFixed(1)}%</span><span className="mini-bar"><i style={{width: `${det.confidence * 100}%`}} /></span></div></td>
          <td className="mono">{Object.values(det.bbox).map(v => Math.round(v)).join(', ')}</td>
        </tr>) : <tr><td className="empty-row" colSpan={4}>{rows.length ? 'No predictions match this filter.' : 'Results will appear after an inspection.'}</td></tr>}</tbody>
      </table></div>
      <div className="results-foot">{filtered.length} visible / {rows.length} predictions · Model outputs, not certified inspection decisions</div>
    </section>
  );
}
