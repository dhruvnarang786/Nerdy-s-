import { useState, useRef, useCallback } from 'react';
import { User, Activity, BookOpen, MessageSquare, Heart } from 'lucide-react';
import { useDnaStats } from './hooks';

export interface TabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const TABS: TabDef[] = [
  { id: 'Profile', label: 'Profile', icon: User },
  { id: 'Activity', label: 'Activity', icon: Activity },
  { id: 'Books', label: 'Books', icon: BookOpen },
  { id: 'Reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'Favorites', label: 'Favorites', icon: Heart },
];

interface DnaTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function useTabPrefetcher() {
  const [prefetchTab, setPrefetchTab] = useState<string | null>(null);
  const hoverTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useDnaStats(prefetchTab === 'Profile');

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
      className="lb-subnav-bar"
      role="tablist"
      aria-label="Profile navigation"
      aria-orientation="horizontal"
    >
      <div className="lb-subnav-links">
        {TABS.map((tab, i) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`lb-subnav-tab ${isActive ? 'active' : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onMouseEnter={() => onHover(tab.id)}
              onMouseLeave={() => onLeave(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface DnaTabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
}

export function DnaTabPanel({ tabId, activeTab, children }: DnaTabPanelProps) {
  const isSelected = activeTab === tabId;
  const [hasRendered, setHasRendered] = useState(isSelected);

  if (isSelected && !hasRendered) {
    setHasRendered(true);
  }

  return (
    <div
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      hidden={!isSelected}
      className="lb-tab-panel"
    >
      {hasRendered ? children : null}
    </div>
  );
}
