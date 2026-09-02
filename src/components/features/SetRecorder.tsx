'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { TrainingSet } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TermHelp } from '@/components/ui/TermHelp';
import { TERM_DEFINITIONS } from '@/lib/terms';
import { DETAILED_MUSCLE_LABELS, getSortedMuscleContributions } from '@/lib/muscleDetails';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import styles from './SetRecorder.module.css';
import { formatDateKey } from '@/lib/date';

interface SetRecorderProps {
    sessionId: number;
    exerciseId: number;
    onBack: () => void;
}

export const SetRecorder = ({ sessionId, exerciseId, onBack }: SetRecorderProps) => {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [rpe, setRpe] = useState('');
    const [durationSeconds, setDurationSeconds] = useState('');
    const [editingSetId, setEditingSetId] = useState<number | null>(null);

    const exercise = useLiveQuery(() => db.exercises.get(exerciseId), [exerciseId]);
    const sets = useLiveQuery(
        () => db.sets.where({ sessionId, exerciseId }).sortBy('order'),
        [sessionId, exerciseId],
    );
    const previousRecord = useLiveQuery(async () => {
        const currentSession = await db.sessions.get(sessionId);
        if (!currentSession) return null;

        const candidateSets = await db.sets.where('exerciseId').equals(exerciseId).toArray();
        const sessionIds = Array.from(new Set(candidateSets.map((set) => set.sessionId).filter((id) => id !== sessionId)));
        if (sessionIds.length === 0) return null;
        const sessions = (await db.sessions.bulkGet(sessionIds))
            .filter((session): session is NonNullable<typeof session> => Boolean(session?.endTime))
            .filter((session) => session.date <= currentSession.date)
            .sort((a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0));
        const previousSession = sessions[0];
        if (!previousSession?.id) return null;
        return {
            date: previousSession.date,
            sets: candidateSets
                .filter((set) => set.sessionId === previousSession.id)
                .sort((a, b) => a.order - b.order),
        };
    }, [sessionId, exerciseId]);

    const resetForm = () => {
        setReps('');
        setRpe('');
        setDurationSeconds('');
        setEditingSetId(null);
    };

    const buildValues = (): Omit<TrainingSet, 'id' | 'sessionId' | 'exerciseId' | 'order'> | null => {
        if (!exercise) return null;
        if (exercise.type === 'duration') {
            const seconds = Number(durationSeconds);
            return seconds > 0 ? { durationSeconds: seconds, rpe: rpe ? Number(rpe) : undefined } : null;
        }
        const repCount = Number(reps);
        if (repCount <= 0) return null;
        if (exercise.type === 'bodyweight_reps') {
            return { reps: repCount, rpe: rpe ? Number(rpe) : undefined };
        }
        const weightValue = Number(weight);
        return weightValue >= 0 ? { weight: weightValue, reps: repCount, rpe: rpe ? Number(rpe) : undefined } : null;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const values = buildValues();
        if (!values) return;

        if (editingSetId) {
            await db.sets.update(editingSetId, values);
        } else {
            await db.sets.add({
                sessionId,
                exerciseId,
                ...values,
                order: (sets?.length ?? 0) + 1,
            });
        }
        resetForm();
    };

    const handleEditSet = (set: TrainingSet) => {
        setEditingSetId(set.id ?? null);
        setWeight(set.weight?.toString() ?? '');
        setReps(set.reps?.toString() ?? '');
        setRpe(set.rpe?.toString() ?? '');
        setDurationSeconds(set.durationSeconds?.toString() ?? '');
    };

    const handleDeleteSet = async (setId: number) => {
        await db.sets.delete(setId);
        if (editingSetId === setId) resetForm();
    };

    const handleCopySet = async (set: TrainingSet) => {
        const { id: _id, ...values } = set;
        void _id;
        await db.sets.add({ ...values, order: (sets?.length ?? 0) + 1 });
    };

    const handleCopyPrevious = async () => {
        if (!previousRecord?.sets.length) return;
        await db.sets.bulkAdd(previousRecord.sets.map((set, index) => ({
            sessionId,
            exerciseId,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            durationSeconds: set.durationSeconds,
            order: (sets?.length ?? 0) + index + 1,
        })));
    };

    if (!exercise) return <div className={styles.loading}>種目を読み込んでいます...</div>;

    const muscleProfile = getSortedMuscleContributions(
        exercise.name,
        exercise.targetMuscles,
        exercise.muscleContributions,
    );

    const formatSet = (set: TrainingSet) => {
        if (exercise.type === 'duration') return `${set.durationSeconds ?? 0}秒`;
        if (exercise.type === 'bodyweight_reps') return `${set.reps ?? 0}回`;
        return `${set.weight ?? 0}kg × ${set.reps ?? 0}回`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={onBack} size="sm">戻る</Button>
                <h3>{exercise.name}</h3>
                <div className={styles.headerSpacer} />
            </div>

            <section className={styles.muscleProfile} aria-label={`${exercise.name}の推定刺激配分`}>
                <div className={styles.profileHeader}>
                    <span>この種目の推定刺激配分</span>
                    <TermHelp definition={TERM_DEFINITIONS.estimatedStimulus} />
                </div>
                <div className={styles.profileList}>
                    {muscleProfile.map(({ muscle, share }) => (
                        <div key={muscle} className={styles.profileItem}>
                            <div>
                                <span>{DETAILED_MUSCLE_LABELS[muscle]}</span>
                                <strong>{Math.round(share * 100)}%</strong>
                            </div>
                            <span className={styles.profileTrack}>
                                <span style={{ width: `${share * 100}%` }} />
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {previousRecord && (
                <section className={styles.previousRecord}>
                    <div>
                        <span>前回 {formatDateKey(previousRecord.date)}</span>
                        <strong>{previousRecord.sets.map(formatSet).join(' / ')}</strong>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={handleCopyPrevious}>
                        <Copy size={15} aria-hidden="true" />
                        全セットをコピー
                    </Button>
                </section>
            )}

            <div className={styles.setsList}>
                {sets?.map((set, index) => (
                    <div key={set.id} className={styles.setRow}>
                        <span className={styles.setNumber}>{index + 1}</span>
                        <strong>{formatSet(set)}</strong>
                        <span className={styles.rpe}>{set.rpe ? `RPE ${set.rpe}` : '—'}</span>
                        <div className={styles.rowActions}>
                            <button type="button" onClick={() => handleCopySet(set)} aria-label={`${index + 1}セット目をコピー`}>
                                <Copy size={16} />
                            </button>
                            <button type="button" onClick={() => handleEditSet(set)} aria-label={`${index + 1}セット目を編集`}>
                                <Pencil size={16} />
                            </button>
                            <button type="button" onClick={() => set.id && handleDeleteSet(set.id)} aria-label={`${index + 1}セット目を削除`}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {!sets?.length && <p className={styles.empty}>最初のセットを記録しましょう。</p>}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputs}>
                    {exercise.type === 'weight_reps' && (
                        <Input
                            type="number"
                            min="0"
                            step="0.5"
                            label="重量 (kg)"
                            value={weight}
                            onChange={(event) => setWeight(event.target.value)}
                            inputMode="decimal"
                            required
                        />
                    )}
                    {exercise.type !== 'duration' && (
                        <Input
                            type="number"
                            min="1"
                            label="回数"
                            value={reps}
                            onChange={(event) => setReps(event.target.value)}
                            inputMode="numeric"
                            required
                        />
                    )}
                    {exercise.type === 'duration' && (
                        <Input
                            type="number"
                            min="1"
                            label="時間 (秒)"
                            value={durationSeconds}
                            onChange={(event) => setDurationSeconds(event.target.value)}
                            inputMode="numeric"
                            required
                        />
                    )}
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        label="RPE"
                        help={<TermHelp definition={TERM_DEFINITIONS.rpe} align="end" />}
                        value={rpe}
                        onChange={(event) => setRpe(event.target.value)}
                        inputMode="decimal"
                    />
                </div>
                <div className={styles.formActions}>
                    {editingSetId && <Button type="button" variant="ghost" onClick={resetForm}>キャンセル</Button>}
                    <Button type="submit" className={styles.addBtn}>{editingSetId ? '変更を保存' : 'セット追加'}</Button>
                </div>
            </form>
        </div>
    );
};
