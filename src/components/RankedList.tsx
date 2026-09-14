interface RankedListItem {
  key: string;
  title: string;
  subtitle?: string;
  value: string;
}

interface Props {
  items: RankedListItem[];
  emptyText: string;
}

export function RankedList({ items, emptyText }: Props) {
  if (items.length === 0) return <p className="hint-text">{emptyText}</p>;

  return (
    <ol className="ranked-list">
      {items.map((item, i) => (
        <li key={item.key} className="ranked-list-item">
          <span className="ranked-list-rank">{i + 1}</span>
          <div className="ranked-list-body">
            <span className="ranked-list-title">{item.title}</span>
            {item.subtitle && <span className="ranked-list-subtitle">{item.subtitle}</span>}
          </div>
          <span className="ranked-list-value">{item.value}</span>
        </li>
      ))}
    </ol>
  );
}
