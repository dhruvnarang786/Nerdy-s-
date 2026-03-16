
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
            <Navbar />
            <main className={`main-content ${isHome ? 'main-content-fluid' : ''}`}>
                {children}
            </main>
            <Footer />
            <FloatingAIBot />
        </div>
    );
}
