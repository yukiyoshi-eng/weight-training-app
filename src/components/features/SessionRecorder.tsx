'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { db, deleteSession } from '@/lib/db';
import type { EquipmentType, MuscleTarget } from '@/lib/db';
import {
    EQUIPMENT_LABELS,
    filterAndSortExercises,
} from '@/lib/exerciseCatalog';
import { toLocalDateKey } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import styles from './SessionRecorder.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { SetRecorder } from './SetRecorder';
import { ExerciseFilterControls } from './ExerciseFilterControls';
import { DETAILED_MUSCLE_LABELS, getSortedMuscleContributions } from '@/lib/muscleDetails';

export const SessionRecorder = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedSessionId = Number(searchParams.get('sessionId')) || null;
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);
    const [memo, setMemo] = useState('');
    const [sessionDate, setSessionDate] = useState(toLocalDateKey());
    const [wasCompleted, setWasCompleted] = useState(false);
    const [originalEndTime, setOriginalEndTime] = useState<string | undefined>();
    const [isReady, setIsReady] = useState(false);
    const [search, setSearch] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'all'>('all');
    const [muscleFilter, setMuscleFilter] = useState<MuscleTarget | 'all'>('all');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [error, setError] = useState('');

    const exercises = useLiveQuery(() => db.exercises.filter((exercise) => !exercise.isDeleted).toArray());
    const sessionSets = useLiveQuery(
        () => db.sets.where('sessionId').equals(sessionId ?? -1).toArray(),
        [sessionId],
    );
    const activeExercises = useLiveQuery(async () => {
        if (!sessionSets?.length) return [];
        const exerciseIds = Array.from(new Set(sessionSets.map((set) => set.exerciseId)));
        return db.exercises.where('id').anyOf(exerciseIds).toArray();
    }, [sessionSets]);

    useEffect(() => {
        let cancelled = false;
        const loadSession = async () => {
            const requested = requestedSessionId ? await db.sessions.get(requestedSessionId) : undefined;
            const draft = requested
                ? undefined
                : await db.sessions.filter((session) => !session.endTime).last();
            const session = requested ?? draft;

            if (!cancelled && session?.id) {
                setSessionId(session.id);
                setMemo(session.memo ?? '');
                setSessionDate(session.date);
                setWasCompleted(Boolean(session.endTime));
                setOriginalEndTime(session.endTime);
            }
            if (!cancelled) setIsReady(true);
        };
        loadSession();
        return () => {
            cancelled = true;
        };
    }, [requestedSessionId]);

    const availableExercises = useMemo(() => {
        return filterAndSortExercises(exercises ?? [], {
            search,
            equipment: equipmentFilter,
            muscle: muscleFilter,
            favoritesOnly,
        });
    }, [equipmentFilter, exercises, favoritesOnly, muscleFilter, search]);

    const activeExerciseIds = useMemo(
        () => new Set((activeExercises ?? []).map((exercise) => exercise.id)),
        [activeExercises],
    );

    const handleStartSession = async () => {
        const now = new Date().toISOString();
        const id = await db.sessions.add({
            date: sessionDate,
            startTime: now,
            updatedAt: now,
        });
        setSessionId(id as number);
        setWasCompleted(false);
    };

    const persistSessionDetails = async (updates: { date?: string; memo?: string }) => {
        if (!sessionId) return;
        await db.sessions.update(sessionId, { ...updates, updatedAt: new Date().toISOString() });
    };

    const handleFinishSession = async () => {
        if (!sessionId) return;
        if (!sessionSets?.length) {
            setError('少なくとも1セット記録してください。');
            return;
        }
        await db.sessions.update(sessionId, {
            date: sessionDate,
            endTime: originalEndTime ?? new Date().toISOString(),
            memo: memo.trim(),
            updatedAt: new Date().toISOString(),
        });
        router.push('/history');
    };

    const handleDeleteSession = async () => {
        if (!sessionId || !confirm(wasCompleted ? 'このトレーニング記録を削除しますか？' : '入力中のトレーニングを破棄しますか？')) return;
        await deleteSession(sessionId);
        setSessionId(null);
        setActiveExerciseId(null);
        setMemo('');
        setSessionDate(toLocalDateKey());
        if (wasCompleted) router.push('/history');
    };

    if (!isReady) return <div className={styles.loading}>記録を読み込んでいます...</div>;

    if (!sessionId) {
        return (
            <div className={styles.startContainer}>
                <div className={styles.startPanel}>
                    <h1>今日のトレーニング</h1>
                    <p>記録はこの端末に自動保存されます。</p>
                    <Input
                        type="date"
                        label="トレーニング日"
                        value={sessionDate}
                        onChange={(event) => setSessionDate(event.target.value)}
                    />
                    <Button size="lg" onClick={handleStartSession}>トレーニング開始</Button>
                </div>
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
                <div>
                    <span className={styles.eyebrow}>{wasCompleted ? 'EDIT WORKOUT' : 'ACTIVE WORKOUT'}</span>
                    <h2>{wasCompleted ? '記録を編集' : '現在のトレーニング'}</h2>
                </div>
                <Button size="sm" onClick={handleFinishSession}>{wasCompleted ? '保存' : '終了'}</Button>
            </div>

            <Card className={styles.sessionInfo}>
                <Input
                    type="date"
                    label="トレーニング日"
                    value={sessionDate}
                    onChange={(event) => {
                        setSessionDate(event.target.value);
                        persistSessionDetails({ date: event.target.value });
                    }}
                />
                <Input
                    label="トレーニングメモ"
                    placeholder="調子やフォームのメモ"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    onBlur={() => persistSessionDetails({ memo: memo.trim() })}
                />
            </Card>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <div className={styles.exerciseList}>
                <h3>記録中の種目</h3>
                {activeExercises?.map((exercise) => (
                    <button
                        type="button"
                        key={exercise.id}
                        className={styles.exerciseItem}
                        onClick={() => setActiveExerciseId(exercise.id!)}
                    >
                        <span>{exercise.name}</span>
                        <ChevronRight size={20} aria-hidden="true" />
                    </button>
                ))}
                {!activeExercises?.length && <p className={styles.empty}>下の一覧から種目を選んでください。</p>}

                <div className={styles.addExercise}>
                    <h4>種目を追加</h4>
                    <div className={styles.searchBox}>
                        <Search size={18} aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="種目を検索"
                            aria-label="追加する種目を検索"
                        />
                    </div>
                    <ExerciseFilterControls
                        equipment={equipmentFilter}
                        muscle={muscleFilter}
                        favoritesOnly={favoritesOnly}
                        onEquipmentChange={setEquipmentFilter}
                        onMuscleChange={setMuscleFilter}
                        onFavoritesChange={setFavoritesOnly}
                    />
                    <p className={styles.resultCount}>{availableExercises.length}種目を表示</p>
                    <div className={styles.searchList}>
                        {availableExercises.map((exercise) => (
                            <button
                                key={exercise.id}
                                className={styles.searchItem}
                                onClick={() => setActiveExerciseId(exercise.id!)}
                            >
                                <Plus size={16} aria-hidden="true" />
                                <span className={styles.exerciseChoiceInfo}>
                                    <span className={styles.exerciseChoiceName}>{exercise.name}</span>
                                    <span className={styles.exerciseChoiceMeta}>
                                        {EQUIPMENT_LABELS[exercise.equipment]} ・ {getSortedMuscleContributions(
                                            exercise.name,
                                            exercise.targetMuscles,
                                            exercise.muscleContributions,
                                        ).slice(0, 3).map(({ muscle, share }) => (
                                            `${DETAILED_MUSCLE_LABELS[muscle]} ${Math.round(share * 100)}%`
                                        )).join(' / ')}
                                    </span>
                                </span>
                                {activeExerciseIds.has(exercise.id) && <span className={styles.activeBadge}>記録中</span>}
                                {exercise.favorite && <span className={styles.favorite}>★</span>}
                            </button>
                        ))}
                        {!availableExercises.length && (
                            <p className={styles.noResults}>条件に合う種目がありません。絞り込みを変更してください。</p>
                        )}
                    </div>
                </div>
            </div>

            <Button variant="ghost" className={styles.deleteSession} onClick={handleDeleteSession}>
                <Trash2 size={16} aria-hidden="true" />
                {wasCompleted ? 'この記録を削除' : 'トレーニングを破棄'}
            </Button>
        </div>
    );
};
