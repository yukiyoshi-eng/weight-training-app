import type { EquipmentType, Exercise, ExerciseType, MuscleTarget } from './db';
import { getMuscleContributions } from './muscleDetails';

export const MUSCLE_TARGETS: MuscleTarget[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'other'];

export const MUSCLE_LABELS: Record<MuscleTarget, string> = {
    chest: '胸',
    back: '背中',
    shoulders: '肩',
    arms: '腕',
    legs: '脚',
    core: '体幹',
    other: '全身・その他',
};

export const EQUIPMENT_TYPES: EquipmentType[] = [
    'barbell',
    'dumbbell',
    'machine',
    'cable',
    'bodyweight',
    'kettlebell',
    'other',
];

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
    barbell: 'バーベル',
    dumbbell: 'ダンベル',
    machine: 'マシン',
    cable: 'ケーブル',
    bodyweight: '自重',
    kettlebell: 'ケトルベル',
    other: 'その他',
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
    weight_reps: '重量 × 回数',
    bodyweight_reps: '自重 × 回数',
    duration: '時間',
};

type CatalogExercise = Pick<Exercise, 'name' | 'targetMuscles' | 'type' | 'equipment' | 'muscleContributions' | 'custom'>;

const exercise = (
    name: string,
    targetMuscles: MuscleTarget[],
    equipment: EquipmentType,
    type: ExerciseType = 'weight_reps',
): CatalogExercise => ({
    name,
    targetMuscles,
    equipment,
    type,
    muscleContributions: getMuscleContributions(name, targetMuscles),
    custom: false,
});

export const DEFAULT_EXERCISES: CatalogExercise[] = [
    exercise('ベンチプレス', ['chest', 'arms'], 'barbell'),
    exercise('インクラインベンチプレス', ['chest', 'shoulders', 'arms'], 'barbell'),
    exercise('クローズグリップベンチプレス', ['chest', 'arms'], 'barbell'),
    exercise('バーベルロウ', ['back', 'arms'], 'barbell'),
    exercise('デッドリフト', ['back', 'legs', 'core'], 'barbell'),
    exercise('スクワット', ['legs', 'core'], 'barbell'),
    exercise('フロントスクワット', ['legs', 'core'], 'barbell'),
    exercise('ルーマニアンデッドリフト', ['legs', 'back'], 'barbell'),
    exercise('ヒップスラスト', ['legs'], 'barbell'),
    exercise('オーバーヘッドプレス', ['shoulders', 'arms'], 'barbell'),
    exercise('バーベルカール', ['arms'], 'barbell'),
    exercise('スカルクラッシャー', ['arms'], 'barbell'),
    exercise('グッドモーニング', ['legs', 'back', 'core'], 'barbell'),
    exercise('バーベルカーフレイズ', ['legs'], 'barbell'),

    exercise('ダンベルベンチプレス', ['chest', 'arms'], 'dumbbell'),
    exercise('インクラインダンベルプレス', ['chest', 'shoulders', 'arms'], 'dumbbell'),
    exercise('ダンベルフライ', ['chest'], 'dumbbell'),
    exercise('ワンハンドダンベルロウ', ['back', 'arms'], 'dumbbell'),
    exercise('ダンベルプルオーバー', ['back', 'chest'], 'dumbbell'),
    exercise('ダンベルショルダープレス', ['shoulders', 'arms'], 'dumbbell'),
    exercise('アーノルドプレス', ['shoulders', 'arms'], 'dumbbell'),
    exercise('サイドレイズ', ['shoulders'], 'dumbbell'),
    exercise('リアレイズ', ['shoulders', 'back'], 'dumbbell'),
    exercise('ダンベルカール', ['arms'], 'dumbbell'),
    exercise('ハンマーカール', ['arms'], 'dumbbell'),
    exercise('トライセプスエクステンション', ['arms'], 'dumbbell'),
    exercise('ブルガリアンスクワット', ['legs', 'core'], 'dumbbell'),
    exercise('ダンベルランジ', ['legs', 'core'], 'dumbbell'),
    exercise('ゴブレットスクワット', ['legs', 'core'], 'dumbbell'),
    exercise('ダンベルルーマニアンデッドリフト', ['legs', 'back'], 'dumbbell'),

    exercise('チェストプレス', ['chest', 'arms'], 'machine'),
    exercise('ペックデック', ['chest'], 'machine'),
    exercise('ラットプルダウン', ['back', 'arms'], 'machine'),
    exercise('シーテッドロウ', ['back', 'arms'], 'machine'),
    exercise('マシンショルダープレス', ['shoulders', 'arms'], 'machine'),
    exercise('リバースペックデック', ['shoulders', 'back'], 'machine'),
    exercise('プリーチャーカール', ['arms'], 'machine'),
    exercise('ディップスマシン', ['chest', 'arms'], 'machine'),
    exercise('レッグプレス', ['legs'], 'machine'),
    exercise('レッグエクステンション', ['legs'], 'machine'),
    exercise('レッグカール', ['legs'], 'machine'),
    exercise('ハックスクワット', ['legs'], 'machine'),
    exercise('カーフレイズマシン', ['legs'], 'machine'),
    exercise('トレッドミル', ['legs'], 'machine', 'duration'),
    exercise('エアロバイク', ['legs'], 'machine', 'duration'),
    exercise('ローイングマシン', ['back', 'legs', 'arms'], 'machine', 'duration'),

    exercise('ケーブルクロスオーバー', ['chest'], 'cable'),
    exercise('ケーブルフライ', ['chest'], 'cable'),
    exercise('ストレートアームプルダウン', ['back'], 'cable'),
    exercise('フェイスプル', ['shoulders', 'back'], 'cable'),
    exercise('ケーブルサイドレイズ', ['shoulders'], 'cable'),
    exercise('ケーブルカール', ['arms'], 'cable'),
    exercise('トライセプスプッシュダウン', ['arms'], 'cable'),
    exercise('ケーブルクランチ', ['core'], 'cable'),

    exercise('プッシュアップ', ['chest', 'arms', 'core'], 'bodyweight', 'bodyweight_reps'),
    exercise('ディップス', ['chest', 'arms'], 'bodyweight', 'bodyweight_reps'),
    exercise('懸垂', ['back', 'arms'], 'bodyweight', 'bodyweight_reps'),
    exercise('チンニング', ['back', 'arms'], 'bodyweight', 'bodyweight_reps'),
    exercise('インバーテッドロウ', ['back', 'arms'], 'bodyweight', 'bodyweight_reps'),
    exercise('自重スクワット', ['legs', 'core'], 'bodyweight', 'bodyweight_reps'),
    exercise('自重ランジ', ['legs', 'core'], 'bodyweight', 'bodyweight_reps'),
    exercise('自重カーフレイズ', ['legs'], 'bodyweight', 'bodyweight_reps'),
    exercise('プランク', ['core'], 'bodyweight', 'duration'),
    exercise('サイドプランク', ['core'], 'bodyweight', 'duration'),
    exercise('クランチ', ['core'], 'bodyweight', 'bodyweight_reps'),
    exercise('レッグレイズ', ['core'], 'bodyweight', 'bodyweight_reps'),
    exercise('マウンテンクライマー', ['core', 'legs'], 'bodyweight', 'duration'),
    exercise('バーピー', ['other', 'legs', 'core'], 'bodyweight', 'bodyweight_reps'),

    exercise('ケトルベルスイング', ['legs', 'back', 'core'], 'kettlebell'),
    exercise('ケトルベルゴブレットスクワット', ['legs', 'core'], 'kettlebell'),
    exercise('ターキッシュゲットアップ', ['shoulders', 'core', 'other'], 'kettlebell'),
    exercise('ケトルベルクリーン＆プレス', ['shoulders', 'legs', 'arms'], 'kettlebell'),

    exercise('アブローラー', ['core'], 'other', 'bodyweight_reps'),
    exercise('縄跳び', ['legs', 'other'], 'other', 'duration'),
];

export type ExerciseFilters = {
    search?: string;
    equipment?: EquipmentType | 'all';
    muscle?: MuscleTarget | 'all';
    favoritesOnly?: boolean;
};

export const filterAndSortExercises = (exercises: Exercise[], filters: ExerciseFilters = {}) => {
    const query = filters.search?.trim().toLocaleLowerCase('ja') ?? '';
    return [...exercises]
        .filter((item) => !item.isDeleted)
        .filter((item) => !query || item.name.toLocaleLowerCase('ja').includes(query))
        .filter((item) => !filters.equipment || filters.equipment === 'all' || item.equipment === filters.equipment)
        .filter((item) => !filters.muscle || filters.muscle === 'all' || item.targetMuscles.includes(filters.muscle))
        .filter((item) => !filters.favoritesOnly || item.favorite)
        .sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || a.name.localeCompare(b.name, 'ja'));
};
