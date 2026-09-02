import { Suspense } from 'react';
import { SessionRecorder } from '@/components/features/SessionRecorder';

export default function RecordPage() {
    return (
        <main style={{ padding: '1rem' }}>
            <Suspense fallback={<p>記録を読み込んでいます...</p>}>
                <SessionRecorder />
            </Suspense>
        </main>
    );
}
