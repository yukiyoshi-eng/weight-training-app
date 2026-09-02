'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, MuscleTarget } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import styles from './MuscleMap.module.css';

export const MuscleMap = () => {
    const muscleVolumes = useLiveQuery(async () => {
        const sets = await db.sets.toArray();
        const volumes: Record<string, number> = {};

        for (const set of sets) {
            const exercise = await db.exercises.get(set.exerciseId);
            if (exercise) {
                const volume = (set.weight || 0) * (set.reps || 0);
                exercise.targetMuscles.forEach(muscle => {
                    volumes[muscle] = (volumes[muscle] || 0) + volume;
                });
            }
        }
        return volumes;
    });

    const maxVolume = muscleVolumes ? Math.max(...Object.values(muscleVolumes)) : 0;

    const getOpacity = (muscle: MuscleTarget) => {
        if (!muscleVolumes || !muscleVolumes[muscle]) return 0.2;
        return 0.2 + (muscleVolumes[muscle] / maxVolume) * 0.8;
    };

    const getColor = (muscle: MuscleTarget) => {
        const opacity = getOpacity(muscle);
        return `rgba(0, 240, 255, ${opacity})`; // Cyan with opacity
    };

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>筋肉の分布</h3>
            <div className={styles.mapWrapper}>
                <svg viewBox="0 0 200 400" className={styles.svg}>
                    {/* Head */}
                    <circle cx="100" cy="40" r="25" fill="var(--surface-hover)" />

                    {/* Shoulders */}
                    <path
                        d="M 60 70 Q 100 60 140 70 L 150 90 L 50 90 Z"
                        fill={getColor('shoulders')}
                        stroke="var(--border)"
                    />

                    {/* Chest */}
                    <path
                        d="M 60 90 L 140 90 L 130 140 L 70 140 Z"
                        fill={getColor('chest')}
                        stroke="var(--border)"
                    />

                    {/* Arms (Biceps/Triceps combined for now) */}
                    <rect x="30" y="90" width="25" height="80" rx="10" fill={getColor('arms')} stroke="var(--border)" />
                    <rect x="145" y="90" width="25" height="80" rx="10" fill={getColor('arms')} stroke="var(--border)" />

                    {/* Core/Abs */}
                    <rect x="70" y="140" width="60" height="80" fill={getColor('core')} stroke="var(--border)" />

                    {/* Back (Visualized as behind or separate, but for 2D map we'll just use a toggle or overlay? 
             For simplicity, let's just map 'back' to the torso area but maybe different shape or just list it below) 
             Actually, let's add a "Back View" toggle later. For now, let's assume this is front view 
             and Back is mapped to the same torso area but maybe we can split it.
             Let's just use the same torso for Back for now or add a separate visual.
          */}

                    {/* Legs */}
                    <rect x="65" y="220" width="30" height="120" rx="10" fill={getColor('legs')} stroke="var(--border)" />
                    <rect x="105" y="220" width="30" height="120" rx="10" fill={getColor('legs')} stroke="var(--border)" />

                </svg>

                {/* Legend / List for clarity */}
                <div className={styles.legend}>
                    {muscleVolumes && Object.entries(muscleVolumes)
                        .sort(([, a], [, b]) => b - a)
                        .map(([muscle, vol]) => (
                            <div key={muscle} className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: getColor(muscle as MuscleTarget) }} />
                                <span className={styles.legendLabel}>{muscle}</span>
                                <span className={styles.legendValue}>{Math.round(vol / 1000)}k</span>
                            </div>
                        ))}
                </div>
            </div>
        </Card>
    );
};
