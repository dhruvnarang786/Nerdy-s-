import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { displayName, userInitial } from '@/lib/displayName';
import { useDnaSnapshot, useDnaRefresh } from '@/lib/dnaApi';
import { DnaSkeleton } from './DnaSkeleton';
import { DnaHero } from './DnaHero';
import { DnaTabBar, DnaTabPanel } from './DnaTabs';
import { DnaNotificationToast } from './DnaNotificationToast';
import { DnaErrorState } from './DnaErrorState';
import { DnaEmptyState } from './DnaEmptyState';
import { OverviewTab } from './tabs/OverviewTab';
import { ActivityTab } from './tabs/ActivityTab';
import { BooksTab } from './tabs/BooksTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { FavoritesTab } from './tabs/FavoritesTab';
import '@/styles/dna-identity.css';

function getArchetypeFromPersonality(personality: unknown, archetypeLabel?: string | null): string | null {
  if (personality && typeof personality === 'object' && 'primaryLabel' in personality) {
    const label = (personality as Record<string, unknown>).primaryLabel;
    if (typeof label === 'string' && label) return label;
  }
  return archetypeLabel || null;
}

export function DnaPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { data: dna, isLoading: dnaLoading, error: dnaError, refetch } = useDnaSnapshot();
  const refreshMutation = useDnaRefresh();
  const [activeTab, setActiveTab] = useState('Profile');
  const announceRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Dynamically recalculate in the background if snapshot is stale
  useEffect(() => {
    if (dna?.snapshot?.stale && !refreshMutation.isPending) {
      refreshMutation.mutate(undefined, {
        onSuccess: () => refetch(),
      });
    }
  }, [dna?.snapshot?.stale, refreshMutation, refetch]);

  if (authLoading || (dnaLoading && !dna)) {
    return <DnaSkeleton phase={1} />;
  }

  if (!isAuthenticated || !user) {
    return <DnaEmptyState.BrandNewUser />;
  }

  if (dnaError && !dna) {
    return (
      <DnaErrorState
        message={(dnaError as Error)?.message || 'Failed to load reading profile'}
        onRetry={() => refetch()}
      />
    );
  }

  const persona = dna?.persona;
  const personality = dna?.personality;
  const narration = dna?.narration;
  const stats = dna?.stats || {
    totalLogs: 0,
    booksThisYear: 0,
    avgRating: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalFavorites: 0,
  };

  const level = persona?.level || 1;
  const xp = persona?.xp || 0;
  const nextLevelXp = persona?.nextLevelXp || 100;
  const archetypeLabel = getArchetypeFromPersonality(personality);
  const confidence = personality?.confidence || 0;
  const sufficientData = dna?.dataQuality?.sufficientData ?? (stats.totalLogs >= 1);

  const heroStats = {
    booksThisYear: stats.booksThisYear,
    avgRating: stats.avgRating,
    currentStreak: stats.currentStreak,
    totalBadges: dna?.badges?.summary?.earned || 0,
  };

  return (
    <div className="dna-page-wrapper">
      <div aria-live="polite" aria-atomic="true" className="dna-sr-only" ref={announceRef} />

      <main>
        {/* ── 1. LETTERBOXD PROFILE HERO ─────────────────────── */}
        <div className="dna-hero-zone">
          <DnaHero
            username={displayName(user.username)}
            level={level}
            xp={xp}
            nextLevelXp={nextLevelXp}
            avatar={userInitial(user.username)}
            archetypeLabel={archetypeLabel}
            personalityLabel={personality?.primaryLabel}
            confidence={confidence}
            identity={narration?.identity || null}
            narrative={narration?.explanation || null}
            narrationVersion={narration?.version}
            stats={heroStats}
            strengths={narration?.strengths || null}
            explorationSuggestion={narration?.explorationSuggestion || null}
            totalLogs={stats.totalLogs}
            sufficientData={sufficientData}
            dataQuality={dna?.dataQuality}
          />
        </div>

        {/* ── 2. SUB-NAVIGATION TABS & PANELS ────────────────── */}
        <div className="dna-content-zone">
          <DnaTabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="dna-tab-content">
            <DnaTabPanel tabId="Profile" activeTab={activeTab}>
              <OverviewTab
                enabled={activeTab === 'Profile'}
                onNavigateTab={handleTabChange}
              />
            </DnaTabPanel>

            <DnaTabPanel tabId="Activity" activeTab={activeTab}>
              <ActivityTab enabled={activeTab === 'Activity'} />
            </DnaTabPanel>

            <DnaTabPanel tabId="Books" activeTab={activeTab}>
              <BooksTab enabled={activeTab === 'Books'} />
            </DnaTabPanel>

            <DnaTabPanel tabId="Reviews" activeTab={activeTab}>
              <ReviewsTab enabled={activeTab === 'Reviews'} />
            </DnaTabPanel>

            <DnaTabPanel tabId="Favorites" activeTab={activeTab}>
              <FavoritesTab enabled={activeTab === 'Favorites'} />
            </DnaTabPanel>
          </div>
        </div>
      </main>

      <DnaNotificationToast />
    </div>
  );
}
