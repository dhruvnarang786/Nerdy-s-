import { useState, useRef, useCallback, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Award, Users, TrendingUp } from 'lucide-react';
import { useDnaStats, useDnaBadges, useDnaTrends } from './hooks';

export interface TabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const TABS: TabDef[] = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Stats', label: 'Stats', icon: BarChart3 },
  { id: 'Badges', label: 'Badges', icon: Award },
  { id: 'Friends', label: 'Friends', icon: Users },
  { id: 'Trends', label: 'Trends', icon: TrendingUp },
];

interface DnaTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function useTabPrefetcher() {
  const [prefetchTab, setPrefetchTab] = useState<string | null>(null);
  const hoverTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useDnaStats(prefetchTab === 'Stats');
  useDnaBadges(prefetchTab === 'Badges');
  useDnaTrends(prefetchTab === 'Trends');

  const onHover = useCallback((tabId: string) => {
    if (hoverTimers.current[tabId]) return;
    hoverTimers.current[tabId] = setTimeout(() => {
      setPrefetchTab(tabId);
    }, 300);
  }, []);

  const onLeave = useCallback((tabId: string) => {
    if (hoverTimers.current[tabId]) {
      clearTimeout(hoverTimers.current[tabId]);
      delete hoverTimers.current[tabId];
    }
  }, []);

  return { onHover, onLeave };
}

export function DnaTabBar({ activeTab, onTabChange }: DnaTabBarProps) {
  const tabBarRef = useRef<HTMLElement>(null);
  const { onHover, onLeave } = useTabPrefetcher();

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    switch (e.key) {
      case 'ArrowRight':
        newIndex = (index + 1) % TABS.length;
        break;
      case 'ArrowLeft':
        newIndex = (index - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = TABS.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    onTabChange(TABS[newIndex].id);
    const buttons = tabBarRef.current?.querySelectorAll('[role="tab"]');
    (buttons?.[newIndex] as HTMLElement)?.focus();
  }, [onTabChange]);

  return (
    <nav
      ref={tabBarRef}
      className="dna-tab-bar"
      role="tablist"
      aria-label="DNA sections"
      aria-orientation="horizontal"
    >
      {TABS.map((tab, i) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`dna-tab ${isActive ? 'active' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onMouseEnter={() => onHover(tab.id)}
            onMouseLeave={() => onLeave(tab.id)}
          >
            <Icon size={16} />
            <span className="dna-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

interface DnaTabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
}

export function DnaTabPanel({ tabId, activeTab, children }: DnaTabPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (tabId === activeTab && panelRef.current) {
      panelRef.current.focus();
    }
  }, [tabId, activeTab]);

  if (tabId !== activeTab) return null;

  return (
    <section
      id={`tabpanel-${tabId}`}
      ref={panelRef}
      className="dna-tab-panel"
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      tabIndex={-1}
    >
      {children}
    </section>
  );
}
