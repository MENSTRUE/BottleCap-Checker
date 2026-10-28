import type { ReactNode } from 'react';

type Props = { label: string; value: string; detail: string; icon: ReactNode; accent?: boolean };
export function StatCard({ label, value, detail, icon, accent = false }: Props) {
  return (
    <div className={`stat-card ${accent ? 'stat-accent' : ''}`}>
      <div className="stat-head"><span>{label}</span><span className="stat-icon">{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}
