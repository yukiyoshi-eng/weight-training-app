'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteSession } from '@/lib/db';
import type { Exercise, TrainingSet } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './SessionList.module.css';

interface SessionListProps {
    date: string;
}

type ExerciseDetails = {
    exercise?: Exercise;
    sets: TrainingSet[];
};

export const SessionList = ({ date }: SessionListProps) => {
    const router = useRouter();
    const sessions = useLiveQuery(() => db.sessions.where('date').equals(date).toArray(), [date]);

    const sessionDetails = useLiveQuery(async () => {
        if (!sessions?.length) return [];

        return Promise.all(sessions.map(async (session) => {
            const sets = await db.sets.where('sessionId').equals(session.id!).toArray();
            const exerciseIds = Array.from(new Set(sets.map((set) => set.exerciseId)));
            const exercises = await db.exercises.where('id').anyOf(exerciseIds).toArray();
            const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
            const setsByExercise = new Map<number, TrainingSet[]>();

            sets.forEach((set) => {
                const current = setsByExercise.get(set.exerciseId) ?? [];
                current.push(set);
                setsByExercise.set(set.exerciseId, current);
            });

            const exerciseDetails: ExerciseDetails[] = Array.from(setsByExercise.entries()).map(([exerciseId, groupedSets]) => ({
                exercise: exerciseMap.get(exerciseId),
                sets: groupedSets.sort((a, b) => a.order - b.order),
            }));

            return { session, exercises: exerciseDetails };
        }));
    }, [sessions]);

    const handleDelete = async (sessionId: number) => {
        if (!confirm('このトレーニング記録を削除しますか？')) return;
        await deleteSession(sessionId);
    };

    if (!sessions?.length) return <div className={styles.empty}>この日のトレーニング記録はありません。</div>;

    return (
        <div className={styles.container}>
            {sessionDetails?.map(({ session, exercises }) => (
                <div key={session.id} className={styles.sessionGroup}>
                    <div className={styles.sessionHeader}>
                        <div>
                            <span className={styles.time}>
                                {session.startTime ? new Date(session.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {session.memo && <span className={styles.memo}>{session.memo}</span>}
                        </div>
                        <div className={styles.sessionActions}>
                            <button
                                type="button"
                                onClick={() => router.push(`/record?sessionId=${session.id}`)}
                                aria-label="この記録を編集"
                            >
                                <Pencil size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => session.id && handleDelete(session.id)}
                                aria-label="この記録を削除"
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    </div>

                    {exercises.map(({ exercise, sets }) => (
                        <Card key={exercise?.id ?? sets[0]?.exerciseId} className={styles.exerciseCard}>
                            <h4 className={styles.exerciseName}>{exercise?.name ?? '削除済みの種目'}</h4>
                            <div className={styles.setsGrid}>
                                {sets.map((set, index) => (
                                    <div key={set.id} className={styles.setRow}>
                                        <span className={styles.setIndex}>{index + 1}</span>
                                        {set.durationSeconds ? (
                                            <span className={styles.setValue}>{set.durationSeconds}秒</span>
                                        ) : (
                                            <>
                                                {set.weight !== undefined && <span className={styles.setValue}>{set.weight}kg</span>}
                                                {set.weight !== undefined && <span className={styles.setX}>×</span>}
                                                <span className={styles.setValue}>{set.reps}回</span>
                                            </>
                                        )}
                                        {set.rpe && <span className={styles.rpe}>RPE {set.rpe}</span>}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                    {!session.endTime && <p className={styles.draft}>入力途中のセッション</p>}
                </div>
            ))}
        </div>
    );
};
