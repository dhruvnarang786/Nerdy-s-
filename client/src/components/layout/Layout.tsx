
import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingAIBot } from '@/components/ui/FloatingAIBot';
import '@/styles/layout.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="layout">
            {/* GLOBAL BOOKSHELF BACKGROUND - Applied to all pages */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
                <div className="lb-hero-bg hero-gradient-bg" style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.95, 
                    mixBlendMode: 'normal', 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    filter: 'sepia(0.3) opacity(0.3) brightness(1.2) contrast(0.9)' 
                }}>
                    <div className="lb-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)' }} />
                </div>
                <div className="hero-noise-overlay" style={{ position: 'absolute', inset: 0 }}></div>
                <div className="hero-radial-glow" style={{ position: 'absolute', inset: 0 }}></div>
            </div>
            
            <Navbar />
            <main className={`main-content ${isHome ? 'main-content-fluid' : ''}`}>
                {children}
            </main>
            <Footer />
            <FloatingAIBot />
        </div>
    );
}
