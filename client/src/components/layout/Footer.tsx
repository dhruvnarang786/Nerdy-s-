
import { Github, Twitter } from 'lucide-react';
import '@/styles/layout.css';

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-title">Nerdy's</span>
                        <p className="footer-desc">
                            Rate, review, and discover your next read.
                        </p>
                    </div>
                    <div className="footer-socials">
                        <a href="#" className="social-link">
                            <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className="social-link">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                </div>
                <div className="footer-copyright">
                    <p className="copyright-text">
                        &copy; {new Date().getFullYear()} Nerdy's. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
