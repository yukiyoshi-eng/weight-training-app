import { DetailedMuscle, Exercise, TrainingSession, TrainingSet } from './db';
import { dateKeyDaysAgo, toLocalDateKey } from './date';
import { DETAILED_MUSCLES, getMuscleContributions } from './muscleDetails';

export type SessionBundle = {
    session: TrainingSession;
    sets: TrainingSet[];
};

export const calculateSetLoad = (set: TrainingSet, exercise?: Exercise) => {
    if (exercise?.type === 'duration') return set.durationSeconds ?? 0;
    if (exercise?.type === 'bodyweight_reps') return set.reps ?? 0;
    return (set.weight ?? 0) * (set.reps ?? 0);
};

export const calculateDetailedMuscleLoads = (
    sets: TrainingSet[],
    exerciseById: Map<number, Exercise>,
) => {
    const loads = Object.fromEntries(DETAILED_MUSCLES.map((muscle) => [muscle, 0])) as Record<DetailedMuscle, number>;
    sets.forEach((set) => {
        const exercise = exerciseById.get(set.exerciseId);
        if (!exercise) return;
        const setLoad = calculateSetLoad(set, exercise);
        getMuscleContributions(exercise.name, exercise.targetMuscles, exercise.muscleContributions)
            .forEach(({ muscle, share }) => {
                loads[muscle] += setLoad * share;
            });
    });
    return loads;
};

export const filterSessionsByDays = (
    sessions: TrainingSession[],
    days: number | null,
    now = new Date(),
) => {
    if (days === null) return sessions;
    const cutoff = dateKeyDaysAgo(days - 1, now);
    return sessions.filter((session) => session.date >= cutoff);
};

export const calculateStreak = (dateKeys: string[], now = new Date()) => {
    const dates = new Set(dateKeys);
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!dates.has(toLocalDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (dates.has(toLocalDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
};

export const summarizeTraining = (
    bundles: SessionBundle[],
    exerciseById: Map<number, Exercise>,
    now = new Date(),
) => {
    const totalLoad = bundles.reduce(
        (total, bundle) => total + bundle.sets.reduce(
            (sum, set) => sum + calculateSetLoad(set, exerciseById.get(set.exerciseId)),
            0,
        ),
        0,
    );
    const maxWeight = bundles.reduce(
        (max, bundle) => Math.max(max, ...bundle.sets.map((set) => set.weight ?? 0)),
        0,
    );

    return {
        sessions: bundles.length,
        totalLoad,
        maxWeight,
        streak: calculateStreak(bundles.map(({ session }) => session.date), now),
    };
};
