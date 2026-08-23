import { AlertTriangle, Search, Lock, Clock, Shield, RefreshCw } from 'lucide-react';

interface DnaErrorStateProps {
  code?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  context?: 'page' | 'tab' | 'background' | 'comparison';
}

const ERROR_MAP: Record<string, { title: string; description: string; Icon: React.ComponentType<{ size?: number; className?: string }>; action?: string }> = {
  DNA_NOT_FOUND: {
    title: "Your DNA hasn't formed yet",
    description: 'Log your first book to start building your reading identity.',
    Icon: Search,
  },
  INSUFFICIENT_DATA: {
    title: 'Need more data',
    description: 'Keep logging — your reader personality emerges after 5 books.',
    Icon: Clock,
  },
  FRIEND_NOT_FOUND: {
    title: 'User not found',
    description: 'No user with that username exists on Nerdy-S.',
    Icon: Search,
  },
  FRIEND_NO_DNA: {
    title: "Friend hasn't unlocked DNA yet",
    description: 'They need to log at least 5 books to generate their reading DNA.',
    Icon: Lock,
  },
  RATE_LIMITED: {
    title: 'Taking a breather',
    description: "You've made too many requests. Wait a moment and try again.",
    Icon: Clock,
  },
  REFRESH_IN_PROGRESS: {
    title: 'Already updating',
    description: "Your DNA is being refreshed right now — it'll be ready in a moment.",
    Icon: RefreshCw,
  },
  UNAUTHORIZED: {
    title: 'Session expired',
    description: 'Please log in again to view your DNA.',
    Icon: Lock,
  },
  FORBIDDEN: {
    title: 'Not your DNA',
    description: 'You can only view your own reading DNA.',
    Icon: Shield,
  },
  INTERNAL_ERROR: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    Icon: AlertTriangle,
  },
};

export function DnaErrorState({ code, message, onRetry, context = 'page' }: DnaErrorStateProps) {
  const config = code ? ERROR_MAP[code] : ERROR_MAP.INTERNAL_ERROR;
  const IconComponent = config?.Icon || AlertTriangle;
  const displayMessage = config?.description || message || 'An unexpected error occurred.';

  const containerClass = context === 'page'
    ? 'dna-error-page'
    : context === 'tab'
      ? 'dna-error-tab'
      : 'dna-error-inline';

  return (
    <div className={containerClass} role="alert" aria-live="assertive">
      <div className="dna-error-card">
        <IconComponent size={40} className="dna-error-icon" />
        <h3 className="dna-error-title">{config?.title || 'Error'}</h3>
        <p className="dna-error-description">{displayMessage}</p>
        {(context === 'page' || context === 'tab') && onRetry && (
          <button className="dna-btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
        {context === 'background' && (
          <p className="dna-error-subtle">Will retry automatically</p>
        )}
      </div>
    </div>
  );
}
