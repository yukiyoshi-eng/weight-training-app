import { DataExport } from '@/components/features/DataExport';
import { ResetDatabase } from '@/components/features/ResetDatabase';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
    return (
        <main style={{ padding: '1rem', paddingBottom: '80px' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>設定</h2>

            <Card style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>設定</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ダークモード</span>
                    <span style={{ color: 'var(--primary)' }}>オン</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>通知</span>
                    <span style={{ color: 'var(--text-muted)' }}>準備中</span>
                </div>
            </Card>

            <DataExport />
            <ResetDatabase />

            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                LiftLog v1.1.0 · データはこの端末に保存されます
            </div>
        </main>
    );
}
