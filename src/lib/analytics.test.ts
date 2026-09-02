import { describe, expect, it } from 'vitest';
import {
    calculateDetailedMuscleLoads,
    calculateSetLoad,
    calculateStreak,
    filterSessionsByDays,
    summarizeTraining,
} from './analytics';
import type { Exercise, TrainingSession } from './db';

const exercises = new Map<number, Exercise>([
    [1, { id: 1, name: 'ベンチプレス', targetMuscles: ['chest'], type: 'weight_reps', equipment: 'barbell', custom: false }],
    [2, { id: 2, name: '懸垂', targetMuscles: ['back'], type: 'bodyweight_reps', equipment: 'bodyweight', custom: false }],
]);

describe('training analytics', () => {
    it('calculates load according to exercise type', () => {
        expect(calculateSetLoad({ sessionId: 1, exerciseId: 1, weight: 60, reps: 10, order: 1 }, exercises.get(1))).toBe(600);
        expect(calculateSetLoad({ sessionId: 1, exerciseId: 2, reps: 8, order: 1 }, exercises.get(2))).toBe(8);
    });

    it('distributes a set load across the detailed muscle profile', () => {
        const loads = calculateDetailedMuscleLoads([
            { sessionId: 1, exerciseId: 1, weight: 60, reps: 10, order: 1 },
        ], exercises);

        expect(loads.middle_chest).toBeCloseTo(330);
        expect(loads.triceps).toBeCloseTo(150);
        expect(loads.front_delts).toBeCloseTo(120);
        expect(Object.values(loads).reduce((sum, value) => sum + value, 0)).toBeCloseTo(600);
    });

    it('filters sessions with local date keys', () => {
        const sessions: TrainingSession[] = [
            { id: 1, date: '2026-08-01' },
            { id: 2, date: '2026-09-01' },
            { id: 3, date: '2026-09-02' },
        ];
        expect(filterSessionsByDays(sessions, 2, new Date(2026, 8, 2)).map((session) => session.id)).toEqual([2, 3]);
    });

    it('calculates a streak that can end yesterday', () => {
        expect(calculateStreak(['2026-08-30', '2026-08-31', '2026-09-01'], new Date(2026, 8, 2))).toBe(3);
        expect(calculateStreak(['2026-08-30'], new Date(2026, 8, 2))).toBe(0);
    });

    it('summarizes completed workout bundles', () => {
        const summary = summarizeTraining([
            {
                session: { id: 1, date: '2026-09-01', endTime: '2026-09-01T10:00:00Z' },
                sets: [
                    { sessionId: 1, exerciseId: 1, weight: 60, reps: 10, order: 1 },
                    { sessionId: 1, exerciseId: 2, reps: 8, order: 2 },
                ],
            },
        ], exercises, new Date(2026, 8, 2));

        expect(summary).toEqual({ sessions: 1, totalLoad: 608, maxWeight: 60, streak: 1 });
    });
});
