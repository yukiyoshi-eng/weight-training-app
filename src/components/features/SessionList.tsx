'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import styles from './SessionList.module.css';

interface SessionListProps {
    date: string;
}

export const SessionList = ({ date }: SessionListProps) => {
    const sessions = useLiveQuery(
        () => db.sessions.where('date').equals(date).toArray()
        , [date]);

    const sessionDetails = useLiveQuery(async () => {
        if (!sessions || sessions.length === 0) return [];

        const details = await Promise.all(sessions.map(async (session) => {
            const sets = await db.sets.where('sessionId').equals(session.id!).toArray();
            const exerciseIds = Array.from(new Set(sets.map(s => s.exerciseId)));
            const exercises = await db.exercises.where('id').anyOf(exerciseIds).toArray();

            // Group sets by exercise
            const exerciseMap = new Map();
            exercises.forEach(ex => exerciseMap.set(ex.id, ex));

            const setsByExercise = new Map();
            sets.forEach(set => {
                if (!setsByExercise.has(set.exerciseId)) {
                    setsByExercise.set(set.exerciseId, []);
                }
                setsByExercise.get(set.exerciseId).push(set);
            });

            return {
                session,
                exercises: Array.from(setsByExercise.entries()).map(([exId, sets]) => ({
                    exercise: exerciseMap.get(exId),
                    sets: sets.sort((a: any, b: any) => a.order - b.order)
                }))
            };
        }));

        return details;
    }, [sessions]);

    if (!sessions || sessions.length === 0) {
        return <div className={styles.empty}>この日のトレーニング記録はありません。</div>;
    }

    return (
        <div className={styles.container}>
            {sessionDetails?.map(({ session, exercises }) => (
                <div key={session.id} className={styles.sessionGroup}>
                    <div className={styles.sessionHeader}>
                        <span className={styles.time}>
                            {session.startTime ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {session.memo && <span className={styles.memo}>{session.memo}</span>}
                    </div>

                    {exercises.map(({ exercise, sets }) => (
                        <Card key={exercise.id} className={styles.exerciseCard}>
                            <h4 className={styles.exerciseName}>{exercise.name}</h4>
                            <div className={styles.setsGrid}>
                                {sets.map((set: any, idx: number) => (
                                    <div key={set.id} className={styles.setRow}>
                                        <span className={styles.setIndex}>{idx + 1}</span>
                                        <span className={styles.setValue}>{set.weight}kg</span>
                                        <span className={styles.setX}>x</span>
                                        <span className={styles.setValue}>{set.reps}</span>
                                        {set.rpe && <span className={styles.rpe}>@{set.rpe}</span>}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            ))}
        </div>
    );
};
