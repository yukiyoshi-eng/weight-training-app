import { VolumeChart } from '@/components/features/VolumeChart';
import { MuscleMap } from '@/components/features/MuscleMap';

export default function AnalysisPage() {
    return (
        <main style={{ padding: '1rem', paddingBottom: '80px' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>分析</h2>
            <VolumeChart />
            <MuscleMap />
        </main>
    );
}
