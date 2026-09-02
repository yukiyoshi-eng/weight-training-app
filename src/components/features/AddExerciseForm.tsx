'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import type { EquipmentType, Exercise, ExerciseType, MuscleTarget } from '@/lib/db';
import {
    EQUIPMENT_LABELS,
    EQUIPMENT_TYPES,
    EXERCISE_TYPE_LABELS,
    MUSCLE_LABELS,
    MUSCLE_TARGETS,
} from '@/lib/exerciseCatalog';
import { getMuscleContributions } from '@/lib/muscleDetails';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import styles from './AddExerciseForm.module.css';

type AddExerciseFormProps = {
    exercise?: Exercise;
    onCancel: () => void;
    onSuccess: () => void;
};

export const AddExerciseForm = ({ exercise, onCancel, onSuccess }: AddExerciseFormProps) => {
    const [name, setName] = useState(exercise?.name ?? '');
    const [selectedMuscles, setSelectedMuscles] = useState<MuscleTarget[]>(exercise?.targetMuscles ?? []);
    const [type, setType] = useState<ExerciseType>(exercise?.type ?? 'weight_reps');
    const [equipment, setEquipment] = useState<EquipmentType>(exercise?.equipment ?? 'dumbbell');
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
                equipment,
                muscleContributions: getMuscleContributions(name.trim(), selectedMuscles),
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
                    <label className={styles.label} htmlFor="exercise-equipment">器具</label>
                    <select
                        id="exercise-equipment"
                        className={styles.select}
                        value={equipment}
                        onChange={(event) => setEquipment(event.target.value as EquipmentType)}
                    >
                        {EQUIPMENT_TYPES.map((value) => (
                            <option key={value} value={value}>{EQUIPMENT_LABELS[value]}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="exercise-type">記録方法</label>
                    <select
                        id="exercise-type"
                        className={styles.select}
                        value={type}
                        onChange={(event) => setType(event.target.value as ExerciseType)}
                    >
                        {Object.entries(EXERCISE_TYPE_LABELS).map(([value, label]) => (
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
                    <p className={styles.fieldNote}>カスタム種目の詳細な筋肉配分は、選んだ部位から自動で推定します。</p>
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
