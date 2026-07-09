import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';

export interface SnapshotMeta {
  computedAt: string;
  version: number;
  stale: boolean;
  dataVersion: string;
  badgeDefVersion: string;
}

export interface DnaPersona {
  username: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  avatar: string;
}

export interface DnaStats {
  totalLogs: number;
  booksThisYear: number;
  avgRating: number;
  currentStreak: number;
  bestStreak: number;
  totalFavorites: number;
}

export interface DnaPersonality {
  primary: string;
  primaryLabel: string;
  secondary: string | null;
  secondaryLabel: string | null;
  confidence: number;
  confidenceLabel: string;
  topContributors: { metric: string; label: string; contribution: number }[];
  allScores?: { archetype: string; score: number }[];
}

export interface DnaNarration {
  version: string;
  computedAt: string;
  identity: string;
  strengths: string[];
  explanation: string;
  explorationSuggestion: string | null;
}

export interface DnaBadgeItem {
  id: string;
  family: string;
  tier: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  progressLabel: string | null;
  unlockedAt: string | null;
}

export interface DnaBadges {
  summary: {
    total: number;
    earned: number;
    earnedByFamily: Record<string, number>;
  };
  items: DnaBadgeItem[];
}

export interface DnaGenre {
  genre: string;
  affinity: number;
  count: number;
  trend: string;
}

export interface DnaHeatmap {
  year: number;
  months: number[];
}

export interface DnaTrends {
  velocity: number;
  momentum: string;
  weeklyCounts: { week: string; count: number }[];
}

export interface DnaStreak {
  currentStreak: number;
  bestStreak: number;
  history: { start: string; end: string; length: number }[];
}

export interface DnaDataQuality {
  totalLogs: number;
  sufficientData: boolean;
  warning: string | null;
}

export interface DnaResponse {
  snapshot: SnapshotMeta;
  persona?: DnaPersona;
  stats?: DnaStats;
  personality?: DnaPersonality;
  narration?: DnaNarration | null;
  badges?: DnaBadges;
  genres?: DnaGenre[];
  heatmap?: DnaHeatmap;
  trends?: DnaTrends;
  streak?: DnaStreak;
  dataQuality?: DnaDataQuality;
  exists?: boolean;
}

export interface BadgeEntry {
  badgeId: string;
  family: string;
  tier: string;
  unlocked: boolean;
  progress: number;
  progressLabel: string;
  unlockedAt?: string;
}

export interface GenreAffinity {
  genre: string;
  affinity: number;
}

export interface DnaEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  processedSnapshotVersion?: number;
}

export interface DnaComparison {
  shared: { genre: string; myAffinity: number; friendAffinity: number }[];
  onlyMe: string[];
  onlyFriend: string[];
  distance: number;
}

export interface BadgeDetails {
  badgeId: string;
  family: string;
  tier: string;
  unlocked: boolean;
  progress: number;
  progressLabel: string;
  unlockedAt?: string;
}

export const dnaKeys = {
  all: ['dna'] as const,
  snapshot: (fields?: string[]) => ['dna', 'snapshot', fields] as const,
  badges: () => ['dna', 'badges'] as const,
  events: (page?: number) => ['dna', 'events', page] as const,
  comparison: (username: string) => ['dna', 'comparison', username] as const,
};

async function fetchSnapshot(fields?: string[]): Promise<DnaResponse> {
  const params = fields?.length ? `?fields=${fields.join(',')}` : '';
  return api.get<DnaResponse>(`/api/dna${params}`);
}

async function fetchBadges(): Promise<{ badges: BadgeDetails[] }> {
  return api.get('/api/dna/badges');
}

async function fetchEvents(page: number = 1): Promise<{ events: DnaEvent[]; pagination: { page: number; total: number; totalPages: number } }> {
  return api.get(`/api/dna/events?page=${page}&limit=20`);
}

async function fetchComparison(username: string): Promise<DnaComparison> {
  return api.get(`/api/dna/comparison/${encodeURIComponent(username)}`);
}

async function postRefresh(): Promise<{ ok: boolean; version: number; newBadges: string[] }> {
  return api.post('/api/dna/refresh');
}

export function useDnaSnapshot(fields?: string[]) {
  return useQuery({
    queryKey: dnaKeys.snapshot(fields),
    queryFn: () => fetchSnapshot(fields),
    staleTime: 0,
    refetchInterval: 1000 * 10,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useDnaBadges() {
  return useQuery({
    queryKey: dnaKeys.badges(),
    queryFn: fetchBadges,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDnaEvents(page: number = 1) {
  return useQuery({
    queryKey: dnaKeys.events(page),
    queryFn: () => fetchEvents(page),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDnaComparison(username: string) {
  return useQuery({
    queryKey: dnaKeys.comparison(username),
    queryFn: () => fetchComparison(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDnaRefresh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRefresh,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dnaKeys.all });
    },
  });
}
