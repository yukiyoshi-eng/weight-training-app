import { describe, expect, it } from 'vitest';
import type { Exercise } from './db';
import { DEFAULT_EXERCISES, filterAndSortExercises } from './exerciseCatalog';
import { DETAILED_MUSCLE_LABELS, hasStandardMuscleProfile } from './muscleDetails';

const catalog = DEFAULT_EXERCISES.map((item, index) => ({ ...item, id: index + 1 })) as Exercise[];

describe('exercise catalog', () => {
    it('provides a broad catalog without duplicate names', () => {
        expect(catalog.length).toBeGreaterThanOrEqual(60);
        expect(new Set(catalog.map((item) => item.name)).size).toBe(catalog.length);
        expect(new Set(catalog.map((item) => item.equipment))).toEqual(
            new Set(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'other']),
        );
    });

    it('provides a normalized detailed muscle profile for every standard exercise', () => {
        catalog.forEach((exercise) => {
            expect(hasStandardMuscleProfile(exercise.name), exercise.name).toBe(true);
            expect(exercise.muscleContributions?.length, exercise.name).toBeGreaterThan(0);
            expect(exercise.muscleContributions?.reduce((sum, item) => sum + item.share, 0), exercise.name)
                .toBeCloseTo(1);
            exercise.muscleContributions?.forEach(({ muscle, share }) => {
                expect(DETAILED_MUSCLE_LABELS[muscle], exercise.name).toBeTruthy();
                expect(share, exercise.name).toBeGreaterThan(0);
            });
        });
    });

    it('combines equipment and muscle filters', () => {
        const results = filterAndSortExercises(catalog, { equipment: 'dumbbell', muscle: 'chest' });
        expect(results.length).toBeGreaterThan(0);
        expect(results.every((item) => item.equipment === 'dumbbell' && item.targetMuscles.includes('chest'))).toBe(true);
    });

    it('searches by name and can limit results to favorites', () => {
        const items = catalog.map((item) => ({ ...item, favorite: item.name === 'ベンチプレス' }));
        expect(filterAndSortExercises(items, { search: 'ベンチ', favoritesOnly: true }).map((item) => item.name))
            .toEqual(['ベンチプレス']);
    });
});
