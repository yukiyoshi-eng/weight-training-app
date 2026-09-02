'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import type { Exercise, ExerciseType, MuscleTarget } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import styles from './AddExerciseForm.module.css';

const MUSCLE_TARGETS: MuscleTarget[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'other'];

export const MUSCLE_LABELS: Record<MuscleTarget, string> = {
    chest: '胸',
    back: '背中',
    shoulders: '肩',
    arms: '腕',
    legs: '脚',
    core: '体幹',
    other: 'その他',
};

const TYPE_LABELS: Record<ExerciseType, string> = {
    weight_reps: '重量 × 回数',
    bodyweight_reps: '自重 × 回数',
    duration: '時間',
};

type AddExerciseFormProps = {
    exercise?: Exercise;
    onCancel: () => void;
    onSuccess: () => void;
};

export const AddExerciseForm = ({ exercise, onCancel, onSuccess }: AddExerciseFormProps) => {
    const [name, setName] = useState(exercise?.name ?? '');
    const [selectedMuscles, setSelectedMuscles] = useState<MuscleTarget[]>(exercise?.targetMuscles ?? []);
    const [type, setType] = useState<ExerciseType>(exercise?.type ?? 'weight_reps');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name.trim() || selectedMuscles.length === 0) {
            setError('種目名とターゲット部位を入力してください。');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const values = {
                name: name.trim(),
                targetMuscles: selectedMuscles,
                type,
                custom: exercise?.custom ?? true,
            };
            if (exercise?.id) {
                await db.exercises.update(exercise.id, values);
            } else {
                await db.exercises.add(values);
            }
            onSuccess();
        } catch {
            setError('種目を保存できませんでした。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMuscle = (muscle: MuscleTarget) => {
        setSelectedMuscles((current) =>
            current.includes(muscle)
                ? current.filter((item) => item !== muscle)
                : [...current, muscle],
        );
    };

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>{exercise ? '種目を編集' : '新規種目の追加'}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="種目名"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="例：ベンチプレス"
                    required
                />

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="exercise-type">記録方法</label>
                    <select
                        id="exercise-type"
                        className={styles.select}
                        value={type}
                        onChange={(event) => setType(event.target.value as ExerciseType)}
                    >
                        {Object.entries(TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <fieldset className={styles.fieldset}>
                    <legend className={styles.label}>ターゲット部位</legend>
                    <div className={styles.muscleGrid}>
                        {MUSCLE_TARGETS.map((muscle) => (
                            <button
                                key={muscle}
                                type="button"
                                className={`${styles.muscleChip} ${selectedMuscles.includes(muscle) ? styles.selected : ''}`}
                                onClick={() => toggleMuscle(muscle)}
                                aria-pressed={selectedMuscles.includes(muscle)}
                            >
                                {MUSCLE_LABELS[muscle]}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                    <Button type="submit" isLoading={isSubmitting}>保存</Button>
                </div>
            </form>
        </Card>
    );
};
