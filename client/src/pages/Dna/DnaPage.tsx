import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useDnaSnapshot, useDnaRefresh, type DnaResponse } from '@/lib/dnaApi';
import { DnaSkeleton } from './DnaSkeleton';
import { DnaHero } from './DnaHero';
import { DnaTabBar, DnaTabPanel } from './DnaTabs';
import { DnaNotificationToast, showToast } from './DnaNotificationToast';
import { DnaErrorState } from './DnaErrorState';
import { DnaEmptyState } from './DnaEmptyState';
import { OverviewTab } from './tabs/OverviewTab';
import { StatsTab } from './tabs/StatsTab';
import { BadgesTab } from './tabs/BadgesTab';
import { FriendsTab } from './tabs/FriendsTab';
import { TrendsTab } from './tabs/TrendsTab';
import '@/styles/dna-identity.css';

const ACCENT_COLORS: Record<string, string> = {
  curator: '#d4af37',
  completionist: '#4ade80',
  critic: '#78716c',
  enthusiast: '#f43f5e',
  explorer: '#a78bfa',
  connoisseur: '#f59e0b',
  snob: '#78716c',
  marathonRunner: '#f97316',
  fanButterfly: '#ec4899',
  loner: '#a68a21',
};

function getAccentColor(archetype: unknown): string {
  if (typeof archetype !== 'string' || !archetype) return '#d4af37';
  const key = archetype.toLowerCase().replace(/\s+/g, '');
  return ACCENT_COLORS[key] || '#d4af37';
}

function getArchetypeFromPersonality(personality: unknown, archetypeLabel?: string | null): string | null {
  if (personality && typeof personality === 'object' && 'primaryLabel' in personality) {
    const label = (personality as Record<string, unknown>).primaryLabel;
    if (typeof label === 'string' && label) return label;
  }
  return archetypeLabel || null;
}

export function DnaPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { data: dna, isLoading: dnaLoading, error: dnaError } = useDnaSnapshot();
  const refreshMutation = useDnaRefresh();
  const [activeTab, setActiveTab] = useState('Overview');
  const hasTriggeredRefresh = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasTriggeredRefresh.current) {
      hasTriggeredRefresh.current = true;
      refreshMutation.mutate();
    }
  }, [isAuthenticated, user, refreshMutation]);
  const [phase, setPhase] = useState<'skeleton' | 'hero' | 'complete'>('skeleton');
  const [entranceDone, setEntranceDone] = useState(false);
  const [prevBadgeEarned, setPrevBadgeEarned] = useState(0);
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dna?.exists && !dnaLoading) {
      const t = setTimeout(() => {
        setPhase(dna.persona ? 'hero' : 'skeleton');
        if (dna.persona) {
          setTimeout(() => setPhase('complete'), 50);
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [dna?.exists, dnaLoading, dna?.persona]);

  useEffect(() => {
    if (phase === 'complete' && !entranceDone) {
      const timeout = setTimeout(() => setEntranceDone(true), 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase, entranceDone]);

  const prevVersion = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!dna?.version) return;
    if (prevVersion.current && dna.version !== prevVersion.current) {
      showToast('success', 'DNA statistics have been updated.');
      if (announceRef.current) {
        announceRef.current.textContent = 'Your DNA statistics have been updated.';
      }
    }
    prevVersion.current = dna.version;
  }, [dna?.version]);

  useEffect(() => {
    if (!dna?.badges?.summary) return;
    const earned = dna.badges.summary.earned;
    if (prevBadgeEarned > 0 && earned > prevBadgeEarned) {
      const newCount = earned - prevBadgeEarned;
      showToast('success', `${newCount} new badge${newCount > 1 ? 's' : ''} unlocked!`);
      if (announceRef.current) {
        announceRef.current.textContent = `${newCount} new badge${newCount > 1 ? 's' : ''} unlocked!`;
      }
    }
    setPrevBadgeEarned(earned);
  }, [dna?.badges?.summary?.earned, prevBadgeEarned]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (authLoading) {
    return <DnaSkeleton phase={1} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="dna-page-wrapper">
        <div className="dna-auth-prompt">
          <h2>Unlock Your Analytics</h2>
          <p>Sign in to view your real-time reading stats and achievements.</p>
        </div>
      </div>
    );
  }

  if (dnaLoading && phase === 'skeleton') {
    return <DnaSkeleton phase={1} />;
  }

  if (dnaError) {
    const err = dnaError as { code?: string };
    const code = err?.code || 'INTERNAL_ERROR';
    return (
      <div className="dna-page-wrapper">
        <DnaErrorState code={code} onRetry={() => refetch()} context="page" />
      </div>
    );
  }

  if (!dna?.exists) {
    return (
      <div className="dna-page-wrapper">
        <DnaEmptyState.BrandNewUser />
      </div>
    );
  }

  const personality = dna.personality;
  const stats = dna.stats || { totalLogs: 0, booksThisYear: 0, avgRating: 0, currentStreak: 0, bestStreak: 0, totalFavorites: 0 };
  const badgeItems = dna.badges?.items || [];
  const genres = dna.genres || [];
  const archetypeLabel = getArchetypeFromPersonality(personality, undefined);
  const narration = dna.narration || null;
  const confidence = personality && typeof personality === 'object' && 'confidence' in personality
    ? (personality as Record<string, unknown>).confidence as number | undefined
    : undefined;
  const accentColor = getAccentColor(personality?.primary || undefined);
  const level = dna.persona?.level || Math.max(1, Math.floor(stats.totalLogs / 5));
  const xp = dna.persona?.xp ?? (stats.totalLogs % 5);
  const nextLevelXp = dna.persona?.nextLevelXp || 5;
  const sufficientData = dna.dataQuality?.sufficientData ?? (stats.totalLogs >= 5);

  const heroStats = {
    booksThisYear: stats.booksThisYear || 0,
    avgRating: stats.avgRating || 0,
    currentStreak: stats.currentStreak || 0,
    totalBadges: dna.badges?.summary?.earned || badgeItems.filter(b => b.unlocked).length || 0,
  };

  return (
    <div
      className={`dna-page-wrapper ${entranceDone ? 'dna-entrance-complete' : ''}`}
      style={{ '--dna-accent': accentColor } as React.CSSProperties}
    >
      <div aria-live="polite" aria-atomic="true" className="dna-sr-only" ref={announceRef} />

      <main>
        <div className="dna-hero-zone">
          <DnaHero
            username={user.username}
            level={level}
            xp={xp}
            nextLevelXp={nextLevelXp}
            avatar={user.username.charAt(0).toUpperCase()}
            archetypeLabel={archetypeLabel}
            personalityLabel={personality?.primaryLabel}
            confidence={confidence}
            identity={narration?.identity || null}
            narrative={narration?.explanation || null}
            narrationVersion={narration?.version}
            stats={heroStats}
            accentColor={accentColor}
            strengths={narration?.strengths || null}
            explorationSuggestion={narration?.explorationSuggestion || null}
            totalLogs={stats.totalLogs}
            sufficientData={sufficientData}
            dataQuality={dna.dataQuality}
          />
        </div>

        {sufficientData && (
          <>
            <DnaTabBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <div className="dna-tab-content">
              <DnaTabPanel tabId="Overview" activeTab={activeTab}>
                <OverviewTab enabled={activeTab === 'Overview'} />
              </DnaTabPanel>

              <DnaTabPanel tabId="Stats" activeTab={activeTab}>
                <StatsTab enabled={activeTab === 'Stats'} />
              </DnaTabPanel>

              <DnaTabPanel tabId="Badges" activeTab={activeTab}>
                <BadgesTab enabled={activeTab === 'Badges'} />
              </DnaTabPanel>

              <DnaTabPanel tabId="Friends" activeTab={activeTab}>
                <FriendsTab />
              </DnaTabPanel>

              <DnaTabPanel tabId="Trends" activeTab={activeTab}>
                <TrendsTab enabled={activeTab === 'Trends'} />
              </DnaTabPanel>
            </div>
          </>
        )}
      </main>

      <DnaNotificationToast />
    </div>
  );
}
