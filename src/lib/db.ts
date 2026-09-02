import Dexie, { Table } from 'dexie';

export type MuscleTarget = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'other';
export type ExerciseType = 'weight_reps' | 'bodyweight_reps' | 'duration';

export interface Exercise {
    id?: number;
    name: string;
    targetMuscles: MuscleTarget[];
    type: ExerciseType;
    custom: boolean; // true if added by user
    isDeleted?: boolean; // Soft delete
    favorite?: boolean;
}

export interface TrainingSession {
    id?: number;
    date: string; // ISO date string YYYY-MM-DD
    startTime?: string;
    endTime?: string;
    memo?: string;
    updatedAt?: string;
}

export interface TrainingSet {
    id?: number;
    sessionId: number;
    exerciseId: number;
    weight?: number;
    reps?: number;
    rpe?: number;
    durationSeconds?: number;
    order: number;
}

export interface Goal {
    id?: number;
    exerciseId: number;
    targetWeight?: number;
    targetReps?: number;
    deadline?: string;
}

export class WeightTrainingDatabase extends Dexie {
    exercises!: Table<Exercise>;
    sessions!: Table<TrainingSession>;
    sets!: Table<TrainingSet>;
    goals!: Table<Goal>;

    constructor() {
        super('WeightTrainingDB');
        this.version(1).stores({
            exercises: '++id, name, *targetMuscles, type, custom, isDeleted',
            sessions: '++id, date',
            sets: '++id, sessionId, exerciseId, [sessionId+exerciseId]',
            goals: '++id, exerciseId, deadline'
        });

        this.version(2).stores({
            exercises: '++id, name, *targetMuscles, type, custom, isDeleted, favorite',
            sessions: '++id, date, endTime, updatedAt',
            sets: '++id, sessionId, exerciseId, [sessionId+exerciseId]',
            goals: '++id, exerciseId, deadline'
        });
    }
}

export const db = new WeightTrainingDatabase();

export const deleteSession = async (sessionId: number) => {
    await db.transaction('rw', db.sessions, db.sets, async () => {
        await db.sets.where('sessionId').equals(sessionId).delete();
        await db.sessions.delete(sessionId);
    });
};

// Initial seed data
db.on('populate', () => {
    db.exercises.bulkAdd([
        { name: 'ベンチプレス', targetMuscles: ['chest', 'arms'], type: 'weight_reps', custom: false },
        { name: 'スクワット', targetMuscles: ['legs', 'core'], type: 'weight_reps', custom: false },
        { name: 'デッドリフト', targetMuscles: ['back', 'legs', 'core'], type: 'weight_reps', custom: false },
        { name: 'オーバーヘッドプレス', targetMuscles: ['shoulders', 'arms'], type: 'weight_reps', custom: false },
        { name: '懸垂', targetMuscles: ['back', 'arms'], type: 'bodyweight_reps', custom: false },
        { name: 'ダンベルカール', targetMuscles: ['arms'], type: 'weight_reps', custom: false },
        { name: 'トライセプスエクステンション', targetMuscles: ['arms'], type: 'weight_reps', custom: false },
        { name: 'プランク', targetMuscles: ['core'], type: 'duration', custom: false },
    ]);
});
