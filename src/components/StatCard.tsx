interface Props {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, tone = 'default' }: Props) {
  return (
    <div className={tone === 'default' ? 'stat-card' : `stat-card stat-card-${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
