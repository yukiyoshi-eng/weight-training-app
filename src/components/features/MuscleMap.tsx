'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { DetailedMuscle } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { TermHelp } from '@/components/ui/TermHelp';
import { calculateDetailedMuscleLoads, filterSessionsByDays } from '@/lib/analytics';
import { DETAILED_MUSCLE_LABELS } from '@/lib/muscleDetails';
import { TERM_DEFINITIONS } from '@/lib/terms';
import styles from './MuscleMap.module.css';

type MuscleShapeProps = {
    muscle: DetailedMuscle;
    d: string;
    getColor: (muscle: DetailedMuscle) => string;
    getPercentage: (muscle: DetailedMuscle) => number;
};

const MuscleShape = ({ muscle, d, getColor, getPercentage }: MuscleShapeProps) => (
    <path d={d} fill={getColor(muscle)} stroke="var(--border)" strokeWidth="1.2">
        <title>{DETAILED_MUSCLE_LABELS[muscle]}: {getPercentage(muscle).toFixed(1)}%</title>
    </path>
);

export const MuscleMap = ({ days }: { days: number | null }) => {
    const [view, setView] = useState<'front' | 'back'>('front');
    const muscleLoads = useLiveQuery(async () => {
        const sessions = filterSessionsByDays(
            await db.sessions.filter((session) => Boolean(session.endTime)).toArray(),
            days,
        );
        const sessionIds = sessions.map((session) => session.id!);
        if (!sessionIds.length) return null;
        const sets = await db.sets.where('sessionId').anyOf(sessionIds).toArray();
        const exercises = await db.exercises.toArray();
        return calculateDetailedMuscleLoads(
            sets,
            new Map(exercises.map((exercise) => [exercise.id!, exercise])),
        );
    }, [days]);

    const entries = Object.entries(muscleLoads ?? {})
        .filter(([, value]) => value > 0)
        .sort(([, a], [, b]) => b - a) as Array<[DetailedMuscle, number]>;
    const totalLoad = entries.reduce((sum, [, value]) => sum + value, 0);
    const maxLoad = Math.max(0, ...entries.map(([, value]) => value));
    const getPercentage = (muscle: DetailedMuscle) => totalLoad > 0
        ? ((muscleLoads?.[muscle] ?? 0) / totalLoad) * 100
        : 0;
    const getColor = (muscle: DetailedMuscle) => {
        const value = muscleLoads?.[muscle] ?? 0;
        const opacity = value > 0 && maxLoad > 0 ? 0.24 + (value / maxLoad) * 0.76 : 0.09;
        return `rgba(0, 240, 255, ${opacity})`;
    };

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <div>
                        <h3 className={styles.title}>筋肉別の刺激分布</h3>
                        <p>詳細な20部位で表示</p>
                    </div>
                    <TermHelp definition={TERM_DEFINITIONS.estimatedStimulus} />
                </div>
                <div className={styles.viewSwitch}>
                    <button className={view === 'front' ? styles.active : ''} onClick={() => setView('front')} aria-pressed={view === 'front'}>正面</button>
                    <button className={view === 'back' ? styles.active : ''} onClick={() => setView('back')} aria-pressed={view === 'back'}>背面</button>
                </div>
            </div>

            {!entries.length ? (
                <div className={styles.empty}>この期間の筋肉データはありません。</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.bodyPanel}>
                        <svg viewBox="0 0 220 420" className={styles.svg} role="img" aria-label={`${view === 'front' ? '正面' : '背面'}の推定刺激分布`}>
                            <circle cx="110" cy="36" r="25" fill="var(--surface-hover)" stroke="var(--border)" />
                            {view === 'front' ? (
                                <>
                                    <MuscleShape muscle="front_delts" d="M58 76 Q73 61 91 72 L86 101 Q69 102 52 91 Z M162 76 Q147 61 129 72 L134 101 Q151 102 168 91 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="side_delts" d="M52 82 Q39 88 38 105 L52 111 L64 91 Z M168 82 Q181 88 182 105 L168 111 L156 91 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="upper_chest" d="M88 73 Q110 65 132 73 L136 92 Q110 84 84 92 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="middle_chest" d="M84 93 Q110 84 136 93 L132 119 Q110 127 88 119 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="lower_chest" d="M88 120 Q110 128 132 120 L128 137 Q110 145 92 137 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="biceps" d="M39 108 Q51 103 61 111 L57 165 Q47 175 36 164 Z M181 108 Q169 103 159 111 L163 165 Q173 175 184 164 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="forearms" d="M36 168 Q47 174 57 167 L51 224 L31 224 Z M184 168 Q173 174 163 167 L169 224 L189 224 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="abs" d="M94 140 L126 140 L128 222 L92 222 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="obliques" d="M76 137 L94 141 L92 222 L78 211 Z M144 137 L126 141 L128 222 L142 211 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="hip_flexors" d="M81 214 L105 223 L102 246 L82 241 Z M139 214 L115 223 L118 246 L138 241 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="quads" d="M76 236 Q91 229 105 244 L99 329 L70 329 Z M144 236 Q129 229 115 244 L121 329 L150 329 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="calves" d="M70 334 L99 334 L94 398 L72 398 Z M150 334 L121 334 L126 398 L148 398 Z" getColor={getColor} getPercentage={getPercentage} />
                                </>
                            ) : (
                                <>
                                    <MuscleShape muscle="traps" d="M88 67 L110 78 L132 67 L140 108 L110 121 L80 108 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="rear_delts" d="M79 73 Q60 66 46 91 L61 107 L86 99 Z M141 73 Q160 66 174 91 L159 107 L134 99 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="rhomboids" d="M88 105 L110 120 L132 105 L128 145 L110 153 L92 145 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="lats" d="M72 105 L92 112 L91 174 L76 211 L64 149 Z M148 105 L128 112 L129 174 L144 211 L156 149 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="triceps" d="M39 108 Q51 103 61 111 L57 165 Q47 175 36 164 Z M181 108 Q169 103 159 111 L163 165 Q173 175 184 164 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="forearms" d="M36 168 Q47 174 57 167 L51 224 L31 224 Z M184 168 Q173 174 163 167 L169 224 L189 224 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="spinal_erectors" d="M96 151 L108 154 L105 224 L94 224 Z M124 151 L112 154 L115 224 L126 224 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="glutes" d="M78 215 Q94 207 108 224 L104 259 Q88 267 74 252 Z M142 215 Q126 207 112 224 L116 259 Q132 267 146 252 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="hamstrings" d="M75 259 Q91 250 104 263 L99 329 L70 329 Z M145 259 Q129 250 116 263 L121 329 L150 329 Z" getColor={getColor} getPercentage={getPercentage} />
                                    <MuscleShape muscle="calves" d="M70 334 L99 334 L94 398 L72 398 Z M150 334 L121 334 L126 398 L148 398 Z" getColor={getColor} getPercentage={getPercentage} />
                                </>
                            )}
                        </svg>
                        <span className={styles.viewLabel}>{view === 'front' ? '正面' : '背面'}</span>
                    </div>

                    <div className={styles.ranking} aria-label="筋肉別の推定刺激割合">
                        {entries.map(([muscle, value]) => {
                            const percentage = (value / totalLoad) * 100;
                            return (
                                <div key={muscle} className={styles.muscleRow}>
                                    <div className={styles.muscleLabel}>
                                        <span>{DETAILED_MUSCLE_LABELS[muscle]}</span>
                                        <strong>{percentage.toFixed(1)}%</strong>
                                    </div>
                                    <div className={styles.barTrack}>
                                        <span className={styles.bar} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
};
