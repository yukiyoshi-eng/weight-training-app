'use client';

import { useState } from 'react';
import { VolumeChart } from '@/components/features/VolumeChart';
import { MuscleMap } from '@/components/features/MuscleMap';
import { TrainingSummary } from '@/components/features/TrainingSummary';
import styles from './page.module.css';

const PERIODS = [
    { label: '30日', value: 30 },
    { label: '90日', value: 90 },
    { label: '全期間', value: null },
] as const;

export default function AnalysisPage() {
    const [days, setDays] = useState<number | null>(30);

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <span>PROGRESS</span>
                    <h1>分析</h1>
                </div>
                <div className={styles.periods} aria-label="分析期間">
                    {PERIODS.map((period) => (
                        <button
                            key={period.label}
                            className={days === period.value ? styles.active : ''}
                            onClick={() => setDays(period.value)}
                            aria-pressed={days === period.value}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>
            <TrainingSummary days={days} />
            <VolumeChart days={days} />
            <MuscleMap days={days} />
        </main>
    );
}
