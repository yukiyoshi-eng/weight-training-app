import Dexie, { Table } from 'dexie';
import { DEFAULT_EXERCISES } from './exerciseCatalog';

export type MuscleTarget = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'other';
export type ExerciseType = 'weight_reps' | 'bodyweight_reps' | 'duration';
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'other';

export interface Exercise {
    id?: number;
    name: string;
    targetMuscles: MuscleTarget[];
    type: ExerciseType;
    equipment: EquipmentType;
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

        this.version(3).stores({
            exercises: '++id, name, *targetMuscles, type, equipment, custom, isDeleted, favorite',
            sessions: '++id, date, endTime, updatedAt',
            sets: '++id, sessionId, exerciseId, [sessionId+exerciseId]',
            goals: '++id, exerciseId, deadline'
        }).upgrade(async (transaction) => {
            const exercises = transaction.table<Exercise>('exercises');
            const existing = await exercises.toArray();
            const catalogByName = new Map(DEFAULT_EXERCISES.map((item) => [item.name, item]));

            await Promise.all(existing.map((item) => {
                if (item.equipment) return Promise.resolve();
                return exercises.update(item.id!, {
                    equipment: catalogByName.get(item.name)?.equipment ?? 'other',
                });
            }));

            const existingNames = new Set(existing.map((item) => item.name));
            const missing = DEFAULT_EXERCISES.filter((item) => !existingNames.has(item.name));
            if (missing.length) await exercises.bulkAdd(missing);
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
    db.exercises.bulkAdd(DEFAULT_EXERCISES);
});
