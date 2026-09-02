'use client';

import React, { useState } from 'react';
import { db, ExerciseType, MuscleTarget } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import styles from './AddExerciseForm.module.css';

const MUSCLE_TARGETS: MuscleTarget[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'other'];

export const AddExerciseForm = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
    const [name, setName] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<MuscleTarget[]>([]);
    const [type, setType] = useState<ExerciseType>('weight_reps');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await db.exercises.add({
                name,
                targetMuscles: selectedMuscles,
                type,
                custom: true,
            });
            setName('');
            setSelectedMuscles([]);
            onSuccess();
        } catch (error) {
            console.error('Failed to add exercise:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMuscle = (muscle: MuscleTarget) => {
        setSelectedMuscles(prev =>
            prev.includes(muscle)
                ? prev.filter(m => m !== muscle)
                : [...prev, muscle]
        );
    };

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>新規種目の追加</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="種目名"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="例：ベンチプレス"
                    required
                />

                <div className={styles.field}>
                    <label className={styles.label}>ターゲット部位</label>
                    <div className={styles.muscleGrid}>
                        {MUSCLE_TARGETS.map(muscle => (
                            <button
                                key={muscle}
                                type="button"
                                className={`${styles.muscleChip} ${selectedMuscles.includes(muscle) ? styles.selected : ''}`}
                                onClick={() => toggleMuscle(muscle)}
                            >
                                {muscle}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                    <Button type="submit" isLoading={isSubmitting}>保存</Button>
                </div>
            </form>
        </Card>
    );
};
