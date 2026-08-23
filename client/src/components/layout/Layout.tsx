
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
            {/* GLOBAL BOOKSHELF BACKGROUND - Applied cleanly across all pages */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.64) contrast(1.08) saturate(0.88)'
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(18,14,12,0.64) 0%, rgba(16,13,11,0.78) 45%, rgba(14,11,10,0.92) 100%)'
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 65%)'
                    }}
                />
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
