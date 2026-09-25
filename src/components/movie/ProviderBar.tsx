interface Provider {
  id: number;
  name: string;
  logoUrl: string;
  color: string;
}

const PROVIDERS: Provider[] = [
  { id: 8, name: 'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w45/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg', color: '#E50914' },
  { id: 337, name: 'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w45/7rwgEs15tFwyR9NPQ5vpzxTj19d.jpg', color: '#113CCF' },
  { id: 350, name: 'Apple TV+', logoUrl: 'https://image.tmdb.org/t/p/w45/6uhKBfmtzFqOcLousHwZuzcrScK.jpg', color: '#555' },
  { id: 15, name: 'Hulu', logoUrl: 'https://image.tmdb.org/t/p/w45/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg', color: '#1CE783' },
  { id: 1899, name: 'Max', logoUrl: 'https://image.tmdb.org/t/p/w45/Ajqyt5aNxNvaM1JcMZE8NlpAHv2.jpg', color: '#002BE7' },
  { id: 386, name: 'Peacock', logoUrl: 'https://image.tmdb.org/t/p/w45/8VCV78prwd9QzZnEm0ReO6bERDa.jpg', color: '#FA5321' },
  { id: 531, name: 'Paramount+', logoUrl: 'https://image.tmdb.org/t/p/w45/h5DcR0J2EESLitnhR8xLG1QymTE.jpg', color: '#0064FF' },
  { id: 9, name: 'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w45/emthp39XA2YScoYL1p0sdbAH2WA.jpg', color: '#00A8E0' },
  { id: 43, name: 'STARZ', logoUrl: 'https://image.tmdb.org/t/p/w45/mhIClFJbSb2sWISLBpobOXOhLXx.jpg', color: '#000' },
];

interface ProviderBarProps {
  onSelectProvider?: (id: number, name: string) => void;
  selectedId?: number | null;
}

export default function ProviderBar({ onSelectProvider, selectedId }: ProviderBarProps) {
  return (
    <section className="px-4 md:px-6">
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">Browse by Provider</h2>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProvider?.(p.id, p.name)}
            title={p.name}
            className={`shrink-0 flex flex-col items-center gap-1.5 transition-all ${selectedId === p.id ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
          >
            <div
              className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-colors ${selectedId === p.id ? 'border-primary' : 'border-border hover:border-primary/50'}`}
            >
              <img
                src={p.logoUrl}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback: colored circle with initials
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = p.color;
                    parent.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:11px;font-weight:700;color:white;">${p.name.slice(0, 2).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{p.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export { PROVIDERS };
