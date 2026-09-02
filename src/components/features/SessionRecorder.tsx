'use client';

import React, { useState, useEffect } from 'react';
import { db, Exercise, TrainingSession, TrainingSet } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Save, Trash2, Clock } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import styles from './SessionRecorder.module.css';
import { useRouter } from 'next/navigation';
import { SetRecorder } from './SetRecorder';
import { Search, ChevronRight } from 'lucide-react';

export const SessionRecorder = () => {
    const router = useRouter();
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
    const [sets, setSets] = useState<TrainingSet[]>([]);
    const [memo, setMemo] = useState('');

    // Load exercises for selection
    const exercises = useLiveQuery(() => db.exercises.toArray());

    // Load exercises that have sets in this session
    const sessionSets = useLiveQuery(
        () => db.sets.where('sessionId').equals(sessionId || -1).toArray()
        , [sessionId]);

    const activeExercises = useLiveQuery(async () => {
        if (!sessionSets || sessionSets.length === 0) return [];
        const exerciseIds = Array.from(new Set(sessionSets.map(s => s.exerciseId)));
        return db.exercises.where('id').anyOf(exerciseIds).toArray();
    }, [sessionSets]);

    // Initialize session on mount
    useEffect(() => {
        const initSession = async () => {
            // Check if there's an active session (simplified for now: just create new or use existing logic later)
            // For now, we'll just start a "draft" state in memory
        };
        initSession();
    }, []);

    const handleStartSession = async () => {
        const id = await db.sessions.add({
            date: new Date().toISOString().split('T')[0],
            startTime: new Date().toISOString(),
        });
        setSessionId(id as number);
    };

    const handleAddSet = async (exerciseId: number, weight: number, reps: number, rpe?: number) => {
        if (!sessionId) return;

        const newSet: TrainingSet = {
            sessionId,
            exerciseId,
            weight,
            reps,
            rpe,
            order: sets.filter(s => s.exerciseId === exerciseId).length + 1
        };

        const id = await db.sets.add(newSet);
        setSets([...sets, { ...newSet, id: id as number }]);
    };

    const handleFinishSession = async () => {
        if (!sessionId) return;
        await db.sessions.update(sessionId, {
            endTime: new Date().toISOString(),
            memo
        });
        router.push('/history');
    };

    // Simplified UI for now
    if (!sessionId) {
        return (
            <div className={styles.startContainer}>
                <Button size="lg" onClick={handleStartSession}>トレーニング開始</Button>
            </div>
        );
    }

    if (activeExerciseId) {
        return (
            <div className={styles.container}>
                <SetRecorder
                    sessionId={sessionId}
                    exerciseId={activeExerciseId}
                    onBack={() => setActiveExerciseId(null)}
                />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>現在のセッション</h2>
                <Button variant="ghost" size="sm" onClick={handleFinishSession}>終了</Button>
            </div>

            <div className={styles.sessionInfo}>
                <Input
                    placeholder="セッションメモ"
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                />
            </div>

            <div className={styles.exerciseList}>
                <h3>種目</h3>
                {activeExercises?.map(ex => (
                    <Card
                        key={ex.id}
                        className={styles.exerciseItem}
                        onClick={() => setActiveExerciseId(ex.id!)}
                    >
                        <span>{ex.name}</span>
                        <ChevronRight size={20} color="var(--text-secondary)" />
                    </Card>
                ))}

                <div className={styles.addExercise}>
                    <h4>種目を追加</h4>
                    <div className={styles.searchList}>
                        {exercises?.map(ex => (
                            <button
                                key={ex.id}
                                className={styles.searchItem}
                                onClick={() => setActiveExerciseId(ex.id!)}
                            >
                                <Plus size={16} />
                                {ex.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
