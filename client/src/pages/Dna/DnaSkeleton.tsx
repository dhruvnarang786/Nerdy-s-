function SkeletonBlock({ width = '100%', height = '16px', borderRadius = '8px', className = '' }: {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}) {
  return (
    <div
      className={`dna-skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius, minHeight: height }}
    />
  );
}

function Phase1FullSkeleton() {
  return (
    <div className="dna-skeleton-phase1" role="status" aria-label="Loading your DNA profile">
      <div style={{ maxWidth: 1250, margin: '0 auto', padding: '2rem 3rem' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginBottom: 24 }}>
          <SkeletonBlock width="128px" height="128px" borderRadius="50%" />
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <SkeletonBlock width="200px" height="28px" borderRadius="6px" />
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <SkeletonBlock width="80px" height="22px" borderRadius="9999px" />
              <SkeletonBlock width="60px" height="22px" borderRadius="6px" />
            </div>
            <div style={{ marginTop: 10 }}><SkeletonBlock width="300px" height="8px" borderRadius="9999px" /></div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <SkeletonBlock width="100%" height="48px" borderRadius="8px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonBlock key={i} width="100%" height="76px" borderRadius="12px" />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          {['Overview', 'Stats', 'Badges', 'Friends', 'Trends'].map(t => (
            <SkeletonBlock key={t} width="90px" height="32px" borderRadius="6px" />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SkeletonBlock width="100%" height="100px" borderRadius="12px" />
            <SkeletonBlock width="100%" height="140px" borderRadius="12px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SkeletonBlock width="100%" height="80px" borderRadius="12px" />
            <SkeletonBlock width="100%" height="200px" borderRadius="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase2ContentSkeleton() {
  return (
    <div className="dna-skeleton-phase2" role="status" aria-label="Loading tab content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonBlock width="100%" height="100px" borderRadius="12px" />
        <SkeletonBlock width="100%" height="200px" borderRadius="12px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <SkeletonBlock key={i} width="100%" height="120px" borderRadius="12px" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DnaSkeletonProps {
  phase: 1 | 2;
}

export function DnaSkeleton({ phase }: DnaSkeletonProps) {
  return phase === 1 ? <Phase1FullSkeleton /> : <Phase2ContentSkeleton />;
}
