'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AddExerciseForm } from './AddExerciseForm';
import { Plus, Search } from 'lucide-react';
import styles from './ExerciseList.module.css';
import { Input } from '@/components/ui/Input';

export const ExerciseList = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [search, setSearch] = useState('');

    const exercises = useLiveQuery(
        () => db.exercises
            .filter(ex =>
                !ex.isDeleted &&
                ex.name.toLowerCase().includes(search.toLowerCase())
            )
            .toArray()
        , [search]);

    if (!exercises) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>種目一覧</h2>
                <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <Plus size={16} style={{ marginRight: 4 }} />
                    新規追加
                </Button>
            </div>

            {isAdding && (
                <AddExerciseForm
                    onCancel={() => setIsAdding(false)}
                    onSuccess={() => setIsAdding(false)}
                />
            )}

            <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={18} />
                <Input
                    placeholder="種目を検索..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.list}>
                {exercises.map(exercise => (
                    <Card key={exercise.id} className={styles.item}>
                        <div className={styles.itemInfo}>
                            <h4 className={styles.itemName}>{exercise.name}</h4>
                            <div className={styles.tags}>
                                {exercise.targetMuscles.map(m => (
                                    <span key={m} className={styles.tag}>{m}</span>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}

                {exercises.length === 0 && (
                    <div className={styles.empty}>
                        種目が見つかりません。
                    </div>
                )}
            </div>
        </div>
    );
};
