import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export interface DnaResponse {
  exists: boolean;
  version?: number;
  computedAt?: string;
  staleAfter?: string;
  stale?: boolean;
  dataVersion?: string;

  persona?: {
    username: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    avatar: string;
  };
  stats?: {
    totalLogs: number;
    booksThisYear: number;
    avgRating: number;
    currentStreak: number;
    bestStreak: number;
    totalFavorites: number;
  };
  personality?: {
    primary: string;
    primaryLabel: string;
    secondary: string | null;
    secondaryLabel: string | null;
    confidence: number;
    confidenceLabel: string;
    topContributors: { metric: string; label: string; contribution: number }[];
  };
  narration?: {
    version: string;
    computedAt: string;
    identity: string;
    strengths: string[];
    explanation: string;
    explorationSuggestion: string | null;
  } | null;
  badges?: {
    summary: { total: number; earned: number; earnedByFamily: Record<string, number> };
    items: {
      id: string; family: string; tier: string;
      label: string; description: string; icon: string;
      unlocked: boolean; progress: number; progressLabel: string | null;
      unlockedAt: string | null;
    }[];
  };
  genres?: { genre: string; affinity: number; count: number; trend: string }[];
  heatmap?: { year: number; months: number[] };
  trends?: { velocity: number; momentum: string; weeklyCounts: { week: string; count: number }[] };
  streak?: { currentStreak: number; bestStreak: number; history: { start: string; end: string; length: number }[] };
  dataQuality?: { totalLogs: number; sufficientData: boolean; warning: string | null };

  archetype?: string;
  archetypeLabel?: string;
  confidence?: number;
  narrative?: string;
  metrics?: Record<string, number>;
}

export interface BadgeEntry {
  badgeId: string;
  family: string;
  tier: string;
  unlocked: boolean;
  progress: number;
  progressLabel: string | null;
  unlockedAt?: string | null;
  reason?: string | null;
}

export interface ComparisonResponse {
  user: {
    username: string; level: number; personality: string;
    stats: { totalLogs: number; booksThisYear: number; avgRating: number; currentStreak: number };
    badges: { total: number; earned: number };
    genres: { topGenre: string; diversity: number };
  };
  friend: {
    username: string; level: number; personality: string;
    stats: { totalLogs: number; booksThisYear: number; avgRating: number; currentStreak: number };
    badges: { total: number; earned: number };
    genres: { topGenre: string; diversity: number };
  };
  differences: {
    statDiffs: { label: string; userValue: number; friendValue: number; diff: number }[];
    commonGenre: string | null;
    personalityClash: boolean;
  };
}

export interface EventEntry {
  id: string; type: string; payload: unknown;
  timestamp: string; processedSnapshotVersion?: number;
}

export interface BadgeDetails {
  badgeId: string; family: string; tier: string;
  unlocked: boolean; progress: number; progressLabel: string | null;
  unlockedAt?: string | null;
}

const DNA_STALE_TIME = 10 * 60 * 1000;

async function fetchDna(fields?: string[]): Promise<DnaResponse> {
  const params = fields?.length ? `?fields=${fields.join(',')}` : '';
  return api.get<DnaResponse>(`/api/dna${params}`);
}

export function useDnaProfile() {
  return useQuery({
    queryKey: ['dna', 'profile'],
    queryFn: () => fetchDna(['profile', 'personality', 'narration']),
    staleTime: DNA_STALE_TIME,
  });
}

export function useDnaStats(enabled: boolean) {
  return useQuery({
    queryKey: ['dna', 'stats'],
    queryFn: () => fetchDna(['stats', 'genres', 'heatmap', 'trends']),
    staleTime: DNA_STALE_TIME,
    enabled,
  });
}

export function useDnaBadges(enabled: boolean) {
  return useQuery({
    queryKey: ['dna', 'badges'],
    queryFn: () => fetchDna(['badges']),
    staleTime: DNA_STALE_TIME,
    enabled,
  });
}

export function useDnaFriends(enabled: boolean) {
  return useQuery({
    queryKey: ['dna', 'friends'],
    queryFn: () => fetchDna(['profile']),
    staleTime: DNA_STALE_TIME,
    enabled,
  });
}

export function useDnaTrends(enabled: boolean) {
  return useQuery({
    queryKey: ['dna', 'trends'],
    queryFn: () => fetchDna(['trends']),
    staleTime: DNA_STALE_TIME,
    enabled,
  });
}

export function useDnaComparison(friendUsername: string | null) {
  return useQuery({
    queryKey: ['dna', 'comparison', friendUsername],
    queryFn: () => api.get<ComparisonResponse>(`/api/dna/comparison/${encodeURIComponent(friendUsername!)}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!friendUsername,
  });
}

export function useDnaEvents(page: number = 1) {
  return useQuery({
    queryKey: ['dna', 'events', page],
    queryFn: () => api.get<{ events: EventEntry[]; pagination: { page: number; total: number; totalPages: number } }>(`/api/dna/events?page=${page}&limit=20`),
    staleTime: 60 * 1000,
  });
}

export function useDnaRefresh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean; version: number; newBadges: string[] }>('/api/dna/refresh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dna'] });
    },
  });
}
