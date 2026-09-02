'use client';

import { Star } from 'lucide-react';
import type { EquipmentType, MuscleTarget } from '@/lib/db';
import {
    EQUIPMENT_LABELS,
    EQUIPMENT_TYPES,
    MUSCLE_LABELS,
    MUSCLE_TARGETS,
} from '@/lib/exerciseCatalog';
import styles from './ExerciseFilterControls.module.css';

type ExerciseFilterControlsProps = {
    equipment: EquipmentType | 'all';
    muscle: MuscleTarget | 'all';
    favoritesOnly: boolean;
    onEquipmentChange: (value: EquipmentType | 'all') => void;
    onMuscleChange: (value: MuscleTarget | 'all') => void;
    onFavoritesChange: (value: boolean) => void;
};

export const ExerciseFilterControls = ({
    equipment,
    muscle,
    favoritesOnly,
    onEquipmentChange,
    onMuscleChange,
    onFavoritesChange,
}: ExerciseFilterControlsProps) => (
    <div className={styles.filters}>
        <div className={styles.filterGroup}>
            <span className={styles.label}>器具から選ぶ</span>
            <div className={styles.chips} role="group" aria-label="器具で絞り込む">
                <button
                    type="button"
                    className={`${styles.chip} ${equipment === 'all' ? styles.active : ''}`}
                    onClick={() => onEquipmentChange('all')}
                    aria-pressed={equipment === 'all'}
                >
                    すべて
                </button>
                {EQUIPMENT_TYPES.map((item) => (
                    <button
                        type="button"
                        key={item}
                        className={`${styles.chip} ${equipment === item ? styles.active : ''}`}
                        onClick={() => onEquipmentChange(item)}
                        aria-pressed={equipment === item}
                    >
                        {EQUIPMENT_LABELS[item]}
                    </button>
                ))}
            </div>
        </div>

        <div className={styles.filterGroup}>
            <span className={styles.label}>部位から選ぶ</span>
            <div className={styles.chips} role="group" aria-label="部位で絞り込む">
                <button
                    type="button"
                    className={`${styles.chip} ${muscle === 'all' ? styles.active : ''}`}
                    onClick={() => onMuscleChange('all')}
                    aria-pressed={muscle === 'all'}
                >
                    すべて
                </button>
                {MUSCLE_TARGETS.map((item) => (
                    <button
                        type="button"
                        key={item}
                        className={`${styles.chip} ${muscle === item ? styles.active : ''}`}
                        onClick={() => onMuscleChange(item)}
                        aria-pressed={muscle === item}
                    >
                        {MUSCLE_LABELS[item]}
                    </button>
                ))}
            </div>
        </div>

        <button
            type="button"
            className={`${styles.favoriteToggle} ${favoritesOnly ? styles.active : ''}`}
            onClick={() => onFavoritesChange(!favoritesOnly)}
            aria-pressed={favoritesOnly}
        >
            <Star size={15} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
            お気に入りのみ
        </button>
    </div>
);
