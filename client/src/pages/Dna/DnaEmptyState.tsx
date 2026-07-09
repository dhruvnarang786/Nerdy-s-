import { useNavigate } from 'react-router-dom';

interface BrandNewUserProps {
  onDismiss?: () => void;
}

function BrandNewUser({ onDismiss }: BrandNewUserProps) {
  const navigate = useNavigate();

  return (
    <div className="dna-empty-state" role="status">
      <div className="dna-empty-decorative" aria-hidden="true">
        <div className="dna-helix-animation">
          <span className="dna-helix-emoji">📚</span>
          <span className="dna-helix-emoji" style={{ animationDelay: '0.5s' }}>📖</span>
          <span className="dna-helix-emoji" style={{ animationDelay: '1s' }}>📕</span>
        </div>
      </div>
      <h2 className="dna-empty-title">Your DNA hasn't formed yet</h2>
      <p className="dna-empty-description">
        Log your first book to start building your reading identity.
        Every rating, review, and favorite shapes your DNA.
      </p>
      <div className="dna-empty-actions">
        <button
          className="dna-btn-primary"
          onClick={() => navigate('/search')}
        >
          Log Your First Book
        </button>
        <button
          className="dna-btn-secondary"
          onClick={() => navigate('/trending')}
        >
          Explore Trending Books
        </button>
      </div>
      <div className="dna-empty-pills">
        <span className="dna-feature-pill">5 logs → unlock your reader personality</span>
        <span className="dna-feature-pill">Ratings shape your stats</span>
        <span className="dna-feature-pill">Badges unlock as you explore</span>
      </div>
    </div>
  );
}

interface InsufficientDataProps {
  totalLogs: number;
  onBrowse?: () => void;
}

function InsufficientData({ totalLogs, onBrowse }: InsufficientDataProps) {
  const navigate = useNavigate();
  const progress = Math.min(totalLogs / 5, 1);

  return (
    <div className="dna-insufficient-state" role="status">
      <div className="dna-insufficient-content">
        <div className="dna-insufficient-icon">📝</div>
        <h3 className="dna-insufficient-title">Not enough data for your DNA story</h3>
        <p className="dna-insufficient-description">
          Your reading identity becomes clear after you log 5 books.
          You're {totalLogs}/5 of the way!
        </p>
        <div className="dna-progress-track">
          <div
            className="dna-progress-fill"
            style={{ width: `${progress * 100}%` }}
            role="progressbar"
            aria-valuenow={totalLogs}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label={`${totalLogs} of 5 books logged`}
          />
        </div>
        <span className="dna-progress-label">{totalLogs} / 5 books logged</span>
        <button
          className="dna-btn-secondary"
          onClick={() => { onBrowse?.(); navigate('/search'); }}
          style={{ marginTop: 16 }}
        >
          Browse Books
        </button>
      </div>
    </div>
  );
}

function NoFriends() {
  return (
    <div className="dna-empty-state" role="status" style={{ maxWidth: 400 }}>
      <div className="dna-empty-decorative" aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        👤
      </div>
      <h2 className="dna-empty-title">Add friends to compare your DNA</h2>
      <p className="dna-empty-description">
        See how your reading personality stacks up against friends.
        Search by username to find and add them.
      </p>
    </div>
  );
}

function NoBadgesYet() {
  const navigate = useNavigate();

  return (
    <div className="dna-empty-state" role="status">
      <div className="dna-empty-decorative" aria-hidden="true">
        <div className="dna-locked-cabinet" style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: '2rem' }}>
          <span>🔒</span><span>🔒</span><span>🔒</span><span>🔒</span>
        </div>
      </div>
      <h2 className="dna-empty-title">No badges yet — but they're waiting to be discovered</h2>
      <p className="dna-empty-description">
        Badges unlock as you read, rate, and explore different genres.
        Keep logging and they'll start appearing!
      </p>
      <div className="dna-empty-actions">
        <button className="dna-btn-secondary" onClick={() => navigate('/search')}>
          Explore different genres
        </button>
      </div>
    </div>
  );
}

export const DnaEmptyState = {
  BrandNewUser,
  InsufficientData,
  NoBadgesYet,
  NoFriends,
};
