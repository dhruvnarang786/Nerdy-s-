import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface GoogleLoginButtonProps {
    onSuccess: () => void;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
    const { loginWithGoogle } = useAuth();
    const buttonRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        // If no client ID is configured, don't render
        if (!CLIENT_ID) return;

        // Wait for Google GSI script to load
        const init = () => {
            if (!window.google || initialized.current) return;
            initialized.current = true;

            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: async (response: { credential: string }) => {
                    try {
                        const success = await loginWithGoogle(response.credential);
                        if (success) onSuccess();
                    } catch {
                        // handled by parent
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'filled_black',
                    size: 'large',
                    type: 'standard',
                    shape: 'pill',
                    text: 'continue_with',
                    width: buttonRef.current.offsetWidth || 360,
                });
            }
        };

        // If script already loaded
        if (window.google) {
            init();
        } else {
            // Poll until the GSI script loads
            const interval = setInterval(() => {
                if (window.google) {
                    clearInterval(interval);
                    init();
                }
            }, 200);
            return () => clearInterval(interval);
        }
    }, [loginWithGoogle, onSuccess]);

    // If no Client ID is configured, render nothing
    if (!CLIENT_ID) return null;

    return <div ref={buttonRef} className="google-login-btn-wrap" />;
}

// Extend Window type for Google GSI
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: object) => void;
                    renderButton: (element: HTMLElement, config: object) => void;
                    prompt: () => void;
                };
            };
        };
    }
}
