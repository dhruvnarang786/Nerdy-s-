import { useState } from 'react';
import { X, Copy, Check, Award, BookOpen, Star, Flame, Sparkles } from 'lucide-react';

interface DnaPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  avatar: string;
  level: number;
  archetypeLabel?: string | null;
  personalityLabel?: string | null;
  totalLogs: number;
  avgRating: number;
  currentStreak: number;
  totalBadges: number;
  identity?: string | null;
}

export function DnaPassportModal({
  isOpen,
  onClose,
  username,
  avatar,
  level,
  archetypeLabel,
  personalityLabel,
  totalLogs,
  avgRating,
  currentStreak,
  totalBadges,
  identity,
}: DnaPassportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayLabel = personalityLabel || archetypeLabel || 'Avid Reader';

  const handleCopy = () => {
    const shareText = `📜 Reader Passport for ${username}\n` +
      `✦ Archetype: ${displayLabel}\n` +
      `✦ Level: ${level}\n` +
      `✦ Books Logged: ${totalLogs} | Avg Rating: ${avgRating.toFixed(1)}⭐\n` +
      `✦ Badges Unlocked: ${totalBadges}\n` +
      `Check out my Reading DNA on Nerdy's!`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dna-modal-backdrop" onClick={onClose}>
      <div className="dna-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="dna-modal-close" onClick={onClose} aria-label="Close passport">
          <X size={18} />
        </button>

        <div className="dna-passport-header">
          <div className="dna-passport-emblem">
            <Sparkles size={22} className="dna-gold-icon" />
          </div>
          <span className="dna-passport-tag">Official Reading Codex</span>
          <h2 className="dna-passport-title">Bibliophile Passport</h2>
        </div>

        <div className="dna-passport-body">
          <div className="dna-passport-user">
            <div className="dna-passport-avatar">{avatar}</div>
            <div className="dna-passport-info">
              <h3 className="dna-passport-username">{username}</h3>
              <div className="dna-passport-badges-row">
                <span className="dna-passport-badge-primary">{displayLabel}</span>
                <span className="dna-passport-badge-level">Level {level}</span>
              </div>
            </div>
          </div>

          {identity && (
            <p className="dna-passport-identity">"{identity}"</p>
          )}

          <div className="dna-passport-stats-grid">
            <div className="dna-passport-stat">
              <BookOpen size={16} className="dna-stat-icon" />
              <span className="dna-stat-value">{totalLogs}</span>
              <span className="dna-stat-label">Books Logged</span>
            </div>
            <div className="dna-passport-stat">
              <Star size={16} className="dna-stat-icon" />
              <span className="dna-stat-value">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
              <span className="dna-stat-label">Avg Rating</span>
            </div>
            <div className="dna-passport-stat">
              <Flame size={16} className="dna-stat-icon" />
              <span className="dna-stat-value">{currentStreak}</span>
              <span className="dna-stat-label">Day Streak</span>
            </div>
            <div className="dna-passport-stat">
              <Award size={16} className="dna-stat-icon" />
              <span className="dna-stat-value">{totalBadges}</span>
              <span className="dna-stat-label">Trophies</span>
            </div>
          </div>
        </div>

        <div className="dna-passport-footer">
          <button className="btn btn-primary btn-glow" onClick={handleCopy} style={{ width: '100%' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied to Clipboard!' : 'Share Reader Passport'}
          </button>
        </div>
      </div>
    </div>
  );
}
