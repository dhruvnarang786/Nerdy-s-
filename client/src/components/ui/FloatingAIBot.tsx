import { useNavigate } from 'react-router-dom';
import '@/styles/components.css';

export function FloatingAIBot() {
    const navigate = useNavigate();

    return (
        <button
            className="floating-bot"
            onClick={() => navigate('/ai-recommend')}
            title="Ask AI for book recommendations"
            aria-label="Open AI book recommender"
        >
            <div className="floating-bot-ring"></div>
            <div className="floating-bot-inner">
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="floating-bot-icon"
                >
                    {/* Brain/AI face SVG */}
                    <circle cx="20" cy="20" r="18" fill="url(#botGrad)" />
                    {/* Eyes */}
                    <ellipse cx="13.5" cy="17" rx="3" ry="3.5" fill="white" opacity="0.9" />
                    <ellipse cx="26.5" cy="17" rx="3" ry="3.5" fill="white" opacity="0.9" />
                    <circle cx="13.5" cy="17.5" r="1.5" fill="#7c3aed" />
                    <circle cx="26.5" cy="17.5" r="1.5" fill="#7c3aed" />
                    {/* Smile */}
                    <path d="M13 25 Q20 30 27 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
                    {/* Sparkles */}
                    <path d="M7 8 L7.8 10 L10 10 L8.4 11.4 L9 13.5 L7 12.2 L5 13.5 L5.6 11.4 L4 10 L6.2 10 Z" fill="#f0abfc" opacity="0.8" />
                    <path d="M33 8 L33.5 9.5 L35 9.5 L33.9 10.4 L34.3 12 L33 11.1 L31.7 12 L32.1 10.4 L31 9.5 L32.5 9.5 Z" fill="#f0abfc" opacity="0.6" />
                    <defs>
                        <linearGradient id="botGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#7c3aed" />
                            <stop offset="1" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <span className="floating-bot-label">Ask AI</span>
        </button>
    );
}
