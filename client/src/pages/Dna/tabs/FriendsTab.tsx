import { useState, useEffect } from 'react';
import { UserPlus, Search, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/apiClient';
import { useDnaComparison } from '../hooks';
import { DnaEmptyState } from '../DnaEmptyState';

interface FriendData {
  id: number;
  username: string;
  _count: { logs: number };
}

export function FriendsTab() {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendMsg, setFriendMsg] = useState('');
  const [comparisonTarget, setComparisonTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: comparison } = useDnaComparison(comparisonTarget);

  useEffect(() => {
    if (isAuthenticated) {
      loadFriends();
    }
  }, [isAuthenticated]);

  const loadFriends = async () => {
    try {
      const res = await api.get<{ friends: FriendData[] }>('/api/friends');
      setFriends(res.friends);
    } catch {
      // silently fail
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFriendMsg('');
    setLoading(true);
    try {
      await api.post('/api/friends/add', { username: addUsername });
      setFriendMsg('Friend added!');
      setAddUsername('');
      await loadFriends();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error adding friend';
      setFriendMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompare = (username: string) => {
    setComparisonTarget(username === comparisonTarget ? null : username);
  };

  return (
    <div className="dna-friends-tab">
      <div className="dna-card">
        <h3 className="dna-card-title">Add Friend</h3>
        <form onSubmit={handleAddFriend} className="dna-friend-add-form">
          <input
            type="text"
            className="dna-input"
            placeholder="Enter username..."
            value={addUsername}
            onChange={e => setAddUsername(e.target.value)}
            required
          />
          <button type="submit" className="dna-btn-primary" style={{ width: 'auto', padding: '8px 20px' }} disabled={loading}>
            <UserPlus size={16} /> {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
        {friendMsg && <p className="dna-msg-success">{friendMsg}</p>}
      </div>

      <div className="dna-card">
        <div className="dna-friends-header">
          <h3 className="dna-card-title">Your Network ({friends.length})</h3>
          <div className="dna-search-wrapper">
            <Search size={14} />
            <input
              type="text"
              className="dna-input-inline"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {friends.length === 0 ? (
          <DnaEmptyState.NoFriends />
        ) : filteredFriends.length === 0 ? (
          <p className="dna-empty-text">No friends match your search</p>
        ) : (
          <div className="dna-friend-list">
            {filteredFriends.map(f => (
              <div key={f.id} className="dna-friend-card">
                <div className="dna-friend-avatar">
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div className="dna-friend-info">
                  <span className="dna-friend-name">{f.username}</span>
                  <span className="dna-friend-meta">Level {Math.max(1, Math.floor(f._count.logs / 5))} • {f._count.logs} Logs</span>
                </div>
                <button
                  className={`dna-btn-icon ${comparisonTarget === f.username ? 'active' : ''}`}
                  onClick={() => handleCompare(f.username)}
                  title={`Compare with ${f.username}`}
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {comparisonTarget && comparison && (
        <div className="dna-card dna-comparison-card" role="region" aria-label={`Comparison with ${comparisonTarget}`}>
          <h3 className="dna-card-title">Comparison with {comparisonTarget}</h3>

          {comparison.differences?.personalityClash && (
            <p className="dna-comparison-clash" role="alert">Personality clash! You have different reader personalities.</p>
          )}

          {comparison.differences?.statDiffs && (
            <div className="dna-comparison-grid">
              {comparison.differences.statDiffs.map((d, i) => (
                <div key={i} className="dna-comparison-stat">
                  <span className="dna-comp-stat-label">{d.label}</span>
                  <div className="dna-comp-values">
                    <span className="dna-comp-you">You: {d.userValue}</span>
                    <span className="dna-comp-them">Them: {d.friendValue}</span>
                  </div>
                  <div className="dna-comp-diff" style={{ color: d.diff >= 0 ? '#4ade80' : '#f43f5e' }}>
                    {d.diff >= 0 ? '+' : ''}{d.diff}
                  </div>
                </div>
              ))}
            </div>
          )}

          {comparison.differences?.commonGenre && (
            <p className="dna-comp-common">Common genre: {comparison.differences.commonGenre}</p>
          )}
        </div>
      )}
    </div>
  );
}
