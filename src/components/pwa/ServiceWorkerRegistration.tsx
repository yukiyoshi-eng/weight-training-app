'use client';

import { useEffect, useState } from 'react';

export const ServiceWorkerRegistration = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const updateStatus = () => setIsOffline(!navigator.onLine);
        updateStatus();
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
            navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => {
                // The app remains usable online even if registration is unavailable.
            });
        }

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    if (!isOffline) return null;
    return <div className="offline-status" role="status">オフラインで利用中</div>;
};
