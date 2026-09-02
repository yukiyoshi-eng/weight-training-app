'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { MuscleTarget } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { calculateSetLoad, filterSessionsByDays } from '@/lib/analytics';
import { MUSCLE_LABELS } from './AddExerciseForm';
import styles from './MuscleMap.module.css';

export const MuscleMap = ({ days }: { days: number | null }) => {
    const [view, setView] = useState<'front' | 'back'>('front');
    const muscleVolumes = useLiveQuery(async () => {
        const sessions = filterSessionsByDays(
            await db.sessions.filter((session) => Boolean(session.endTime)).toArray(),
            days,
        );
        const sessionIds = sessions.map((session) => session.id!);
        if (!sessionIds.length) return {} as Record<MuscleTarget, number>;
        const sets = await db.sets.where('sessionId').anyOf(sessionIds).toArray();
        const exercises = await db.exercises.toArray();
        const exerciseById = new Map(exercises.map((exercise) => [exercise.id!, exercise]));
        const volumes = {} as Record<MuscleTarget, number>;

        sets.forEach((set) => {
            const exercise = exerciseById.get(set.exerciseId);
            if (!exercise) return;
            const load = calculateSetLoad(set, exercise);
            exercise.targetMuscles.forEach((muscle) => {
                volumes[muscle] = (volumes[muscle] ?? 0) + load;
            });
        });
        return volumes;
    }, [days]);

    const maxVolume = Math.max(0, ...Object.values(muscleVolumes ?? {}));
    const getColor = (muscle: MuscleTarget) => {
        const value = muscleVolumes?.[muscle] ?? 0;
        const opacity = value > 0 && maxVolume > 0 ? 0.28 + (value / maxVolume) * 0.72 : 0.12;
        return `rgba(0, 240, 255, ${opacity})`;
    };

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>筋肉の分布</h3>
                <div className={styles.viewSwitch}>
                    <button className={view === 'front' ? styles.active : ''} onClick={() => setView('front')} aria-pressed={view === 'front'}>正面</button>
                    <button className={view === 'back' ? styles.active : ''} onClick={() => setView('back')} aria-pressed={view === 'back'}>背面</button>
                </div>
            </div>
            <div className={styles.mapWrapper}>
                <svg viewBox="0 0 200 400" className={styles.svg} role="img" aria-label={`${view === 'front' ? '正面' : '背面'}の筋肉分布`}>
                    <circle cx="100" cy="40" r="25" fill="var(--surface-hover)" />
                    <path d="M 60 70 Q 100 60 140 70 L 150 90 L 50 90 Z" fill={getColor('shoulders')} stroke="var(--border)" />
                    <path d="M 60 90 L 140 90 L 130 145 L 70 145 Z" fill={getColor(view === 'front' ? 'chest' : 'back')} stroke="var(--border)" />
                    <rect x="30" y="90" width="25" height="85" rx="10" fill={getColor('arms')} stroke="var(--border)" />
                    <rect x="145" y="90" width="25" height="85" rx="10" fill={getColor('arms')} stroke="var(--border)" />
                    <rect x="70" y="145" width="60" height="75" fill={getColor(view === 'front' ? 'core' : 'back')} stroke="var(--border)" />
                    <rect x="65" y="220" width="30" height="125" rx="10" fill={getColor('legs')} stroke="var(--border)" />
                    <rect x="105" y="220" width="30" height="125" rx="10" fill={getColor('legs')} stroke="var(--border)" />
                </svg>

                <div className={styles.legend}>
                    {Object.entries(muscleVolumes ?? {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([muscle, value]) => (
                            <div key={muscle} className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: getColor(muscle as MuscleTarget) }} />
                                <span className={styles.legendLabel}>{MUSCLE_LABELS[muscle as MuscleTarget]}</span>
                                <span className={styles.legendValue}>{Math.round(value).toLocaleString()}</span>
                            </div>
                        ))}
                    {!Object.keys(muscleVolumes ?? {}).length && <p className={styles.empty}>データなし</p>}
                </div>
            </div>
        </Card>
    );
};
