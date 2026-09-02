'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Exercise } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AddExerciseForm, MUSCLE_LABELS } from './AddExerciseForm';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import styles from './ExerciseList.module.css';
import { Input } from '@/components/ui/Input';

export const ExerciseList = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [search, setSearch] = useState('');

    const exercises = useLiveQuery(
        () => db.exercises
            .filter((exercise) =>
                !exercise.isDeleted && exercise.name.toLowerCase().includes(search.toLowerCase()),
            )
            .toArray(),
        [search],
    );

    const handleDelete = async (exercise: Exercise) => {
        if (!exercise.id || !confirm(`「${exercise.name}」を種目一覧から削除しますか？\n過去の記録は保持されます。`)) return;
        await db.exercises.update(exercise.id, { isDeleted: true });
        if (editingExercise?.id === exercise.id) setEditingExercise(null);
    };

    const toggleFavorite = async (exercise: Exercise) => {
        if (!exercise.id) return;
        await db.exercises.update(exercise.id, { favorite: !exercise.favorite });
    };

    if (!exercises) return <div>読み込み中...</div>;

    const sortedExercises = [...exercises].sort((a, b) =>
        Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || a.name.localeCompare(b.name, 'ja'),
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>種目一覧</h2>
                <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding || Boolean(editingExercise)}>
                    <Plus size={16} aria-hidden="true" />
                    新規追加
                </Button>
            </div>

            {(isAdding || editingExercise) && (
                <AddExerciseForm
                    exercise={editingExercise ?? undefined}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingExercise(null);
                    }}
                    onSuccess={() => {
                        setIsAdding(false);
                        setEditingExercise(null);
                    }}
                />
            )}

            <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={18} aria-hidden="true" />
                <Input
                    aria-label="種目を検索"
                    placeholder="種目を検索..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.list}>
                {sortedExercises.map((exercise) => (
                    <Card key={exercise.id} className={styles.item}>
                        <button
                            type="button"
                            className={styles.favoriteButton}
                            onClick={() => toggleFavorite(exercise)}
                            aria-label={exercise.favorite ? `${exercise.name}をお気に入りから外す` : `${exercise.name}をお気に入りに追加`}
                        >
                            <Star size={18} fill={exercise.favorite ? 'currentColor' : 'none'} />
                        </button>
                        <div className={styles.itemInfo}>
                            <h4 className={styles.itemName}>{exercise.name}</h4>
                            <div className={styles.tags}>
                                {exercise.targetMuscles.map((muscle) => (
                                    <span key={muscle} className={styles.tag}>{MUSCLE_LABELS[muscle]}</span>
                                ))}
                            </div>
                        </div>
                        <div className={styles.itemActions}>
                            <button type="button" onClick={() => setEditingExercise(exercise)} aria-label={`${exercise.name}を編集`}>
                                <Pencil size={18} />
                            </button>
                            <button type="button" onClick={() => handleDelete(exercise)} aria-label={`${exercise.name}を削除`}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </Card>
                ))}

                {exercises.length === 0 && <div className={styles.empty}>種目が見つかりません。</div>}
            </div>
        </div>
    );
};
