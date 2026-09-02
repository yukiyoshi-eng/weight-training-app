'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, TrainingSet, Exercise } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Trash2, Copy } from 'lucide-react';
import styles from './SetRecorder.module.css';

interface SetRecorderProps {
    sessionId: number;
    exerciseId: number;
    onBack: () => void;
}

export const SetRecorder = ({ sessionId, exerciseId, onBack }: SetRecorderProps) => {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [rpe, setRpe] = useState('');

    const exercise = useLiveQuery(() => db.exercises.get(exerciseId), [exerciseId]);

    const sets = useLiveQuery(
        () => db.sets
            .where({ sessionId, exerciseId })
            .sortBy('order')
        , [sessionId, exerciseId]);

    const handleAddSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight || !reps) return;

        const currentSets = sets || [];
        await db.sets.add({
            sessionId,
            exerciseId,
            weight: parseFloat(weight),
            reps: parseInt(reps),
            rpe: rpe ? parseFloat(rpe) : undefined,
            order: currentSets.length + 1
        });

        // Keep weight for next set, clear reps/rpe? Or keep all?
        // Usually keeping all is better for straight sets.
    };

    const handleDeleteSet = async (setId: number) => {
        await db.sets.delete(setId);
    };

    if (!exercise) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={onBack} size="sm">戻る</Button>
                <h3>{exercise.name}</h3>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </div>

            <div className={styles.setsList}>
                <div className={styles.setHeader}>
                    <span>セット</span>
                    <span>kg</span>
                    <span>回数</span>
                    <span>RPE</span>
                    <span></span>
                </div>
                {sets?.map((set, index) => (
                    <div key={set.id} className={styles.setRow}>
                        <span className={styles.setNumber}>{index + 1}</span>
                        <span>{set.weight}</span>
                        <span>{set.reps}</span>
                        <span>{set.rpe || '-'}</span>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => set.id && handleDeleteSet(set.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddSet} className={styles.form}>
                <div className={styles.inputs}>
                    <Input
                        type="number"
                        placeholder="kg"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className={styles.input}
                        inputMode="decimal"
                    />
                    <Input
                        type="number"
                        placeholder="回数"
                        value={reps}
                        onChange={e => setReps(e.target.value)}
                        className={styles.input}
                        inputMode="numeric"
                    />
                    <Input
                        type="number"
                        placeholder="RPE"
                        value={rpe}
                        onChange={e => setRpe(e.target.value)}
                        className={styles.input}
                        inputMode="decimal"
                    />
                </div>
                <Button type="submit" className={styles.addBtn}>セット追加</Button>
            </form>
        </div>
    );
};
