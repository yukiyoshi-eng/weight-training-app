import type { DetailedMuscle, MuscleContribution, MuscleTarget } from './db';

export const DETAILED_MUSCLE_LABELS: Record<DetailedMuscle, string> = {
    upper_chest: '大胸筋上部',
    middle_chest: '大胸筋中部',
    lower_chest: '大胸筋下部',
    lats: '広背筋',
    traps: '僧帽筋',
    rhomboids: '菱形筋',
    spinal_erectors: '脊柱起立筋',
    front_delts: '三角筋前部',
    side_delts: '三角筋中部',
    rear_delts: '三角筋後部',
    biceps: '上腕二頭筋',
    triceps: '上腕三頭筋',
    forearms: '前腕筋群',
    quads: '大腿四頭筋',
    hamstrings: 'ハムストリングス',
    glutes: '大殿筋',
    calves: '下腿三頭筋',
    abs: '腹直筋',
    obliques: '腹斜筋',
    hip_flexors: '腸腰筋',
};

export const DETAILED_MUSCLE_GROUPS: Record<MuscleTarget, DetailedMuscle[]> = {
    chest: ['upper_chest', 'middle_chest', 'lower_chest'],
    back: ['lats', 'traps', 'rhomboids', 'spinal_erectors'],
    shoulders: ['front_delts', 'side_delts', 'rear_delts'],
    arms: ['biceps', 'triceps', 'forearms'],
    legs: ['quads', 'hamstrings', 'glutes', 'calves', 'hip_flexors'],
    core: ['abs', 'obliques', 'spinal_erectors'],
    other: [],
};

export const DETAILED_MUSCLES = Object.keys(DETAILED_MUSCLE_LABELS) as DetailedMuscle[];

const mix = (weights: Partial<Record<DetailedMuscle, number>>): MuscleContribution[] => {
    const entries = Object.entries(weights) as Array<[DetailedMuscle, number]>;
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    return entries.map(([muscle, value]) => ({ muscle, share: value / total }));
};

export const STANDARD_MUSCLE_MIXES: Record<string, MuscleContribution[]> = {
    'ベンチプレス': mix({ middle_chest: 55, triceps: 25, front_delts: 20 }),
    'インクラインベンチプレス': mix({ upper_chest: 50, front_delts: 25, triceps: 25 }),
    'クローズグリップベンチプレス': mix({ triceps: 50, middle_chest: 30, front_delts: 20 }),
    'バーベルロウ': mix({ lats: 35, rhomboids: 25, rear_delts: 15, biceps: 15, forearms: 10 }),
    'デッドリフト': mix({ glutes: 25, hamstrings: 25, spinal_erectors: 20, quads: 10, traps: 10, lats: 5, forearms: 5 }),
    'スクワット': mix({ quads: 40, glutes: 30, hamstrings: 15, spinal_erectors: 10, abs: 5 }),
    'フロントスクワット': mix({ quads: 50, glutes: 25, abs: 15, spinal_erectors: 10 }),
    'ルーマニアンデッドリフト': mix({ hamstrings: 40, glutes: 30, spinal_erectors: 20, forearms: 10 }),
    'ヒップスラスト': mix({ glutes: 60, hamstrings: 25, quads: 10, abs: 5 }),
    'オーバーヘッドプレス': mix({ front_delts: 30, side_delts: 25, triceps: 30, upper_chest: 10, traps: 5 }),
    'バーベルカール': mix({ biceps: 70, forearms: 30 }),
    'スカルクラッシャー': mix({ triceps: 85, forearms: 15 }),
    'グッドモーニング': mix({ hamstrings: 35, glutes: 25, spinal_erectors: 30, abs: 10 }),
    'バーベルカーフレイズ': mix({ calves: 90, quads: 10 }),

    'ダンベルベンチプレス': mix({ middle_chest: 50, triceps: 25, front_delts: 25 }),
    'インクラインダンベルプレス': mix({ upper_chest: 50, front_delts: 30, triceps: 20 }),
    'ダンベルフライ': mix({ middle_chest: 75, front_delts: 15, biceps: 10 }),
    'ワンハンドダンベルロウ': mix({ lats: 40, rhomboids: 20, rear_delts: 10, biceps: 20, forearms: 10 }),
    'ダンベルプルオーバー': mix({ lats: 45, middle_chest: 30, triceps: 15, abs: 10 }),
    'ダンベルショルダープレス': mix({ front_delts: 35, side_delts: 30, triceps: 30, traps: 5 }),
    'アーノルドプレス': mix({ front_delts: 40, side_delts: 30, triceps: 25, traps: 5 }),
    'サイドレイズ': mix({ side_delts: 80, traps: 15, front_delts: 5 }),
    'リアレイズ': mix({ rear_delts: 65, rhomboids: 25, traps: 10 }),
    'ダンベルカール': mix({ biceps: 75, forearms: 25 }),
    'ハンマーカール': mix({ biceps: 55, forearms: 45 }),
    'トライセプスエクステンション': mix({ triceps: 85, front_delts: 10, forearms: 5 }),
    'ブルガリアンスクワット': mix({ quads: 40, glutes: 35, hamstrings: 15, calves: 5, abs: 5 }),
    'ダンベルランジ': mix({ quads: 40, glutes: 30, hamstrings: 15, calves: 5, abs: 10 }),
    'ゴブレットスクワット': mix({ quads: 45, glutes: 30, hamstrings: 10, abs: 10, forearms: 5 }),
    'ダンベルルーマニアンデッドリフト': mix({ hamstrings: 40, glutes: 30, spinal_erectors: 15, forearms: 15 }),

    'チェストプレス': mix({ middle_chest: 55, triceps: 25, front_delts: 20 }),
    'ペックデック': mix({ middle_chest: 80, front_delts: 15, biceps: 5 }),
    'ラットプルダウン': mix({ lats: 55, biceps: 25, rhomboids: 10, rear_delts: 5, forearms: 5 }),
    'シーテッドロウ': mix({ lats: 35, rhomboids: 30, rear_delts: 15, biceps: 15, forearms: 5 }),
    'マシンショルダープレス': mix({ front_delts: 35, side_delts: 30, triceps: 30, traps: 5 }),
    'リバースペックデック': mix({ rear_delts: 70, rhomboids: 20, traps: 10 }),
    'プリーチャーカール': mix({ biceps: 85, forearms: 15 }),
    'ディップスマシン': mix({ triceps: 45, lower_chest: 40, front_delts: 15 }),
    'レッグプレス': mix({ quads: 50, glutes: 30, hamstrings: 15, calves: 5 }),
    'レッグエクステンション': mix({ quads: 95, hip_flexors: 5 }),
    'レッグカール': mix({ hamstrings: 90, calves: 10 }),
    'ハックスクワット': mix({ quads: 55, glutes: 25, hamstrings: 10, calves: 10 }),
    'カーフレイズマシン': mix({ calves: 100 }),
    'トレッドミル': mix({ quads: 25, glutes: 20, hamstrings: 20, calves: 20, hip_flexors: 10, abs: 5 }),
    'エアロバイク': mix({ quads: 40, glutes: 20, hamstrings: 15, calves: 10, hip_flexors: 10, abs: 5 }),
    'ローイングマシン': mix({ lats: 25, quads: 20, hamstrings: 15, glutes: 10, biceps: 10, rhomboids: 10, spinal_erectors: 5, abs: 5 }),

    'ケーブルクロスオーバー': mix({ middle_chest: 50, lower_chest: 20, front_delts: 15, biceps: 10, abs: 5 }),
    'ケーブルフライ': mix({ middle_chest: 75, front_delts: 15, biceps: 10 }),
    'ストレートアームプルダウン': mix({ lats: 70, triceps: 15, abs: 10, rear_delts: 5 }),
    'フェイスプル': mix({ rear_delts: 45, rhomboids: 25, traps: 20, biceps: 10 }),
    'ケーブルサイドレイズ': mix({ side_delts: 80, traps: 15, front_delts: 5 }),
    'ケーブルカール': mix({ biceps: 80, forearms: 20 }),
    'トライセプスプッシュダウン': mix({ triceps: 90, forearms: 10 }),
    'ケーブルクランチ': mix({ abs: 75, obliques: 20, hip_flexors: 5 }),

    'プッシュアップ': mix({ middle_chest: 45, triceps: 25, front_delts: 15, abs: 10, obliques: 5 }),
    'ディップス': mix({ lower_chest: 45, triceps: 35, front_delts: 15, abs: 5 }),
    '懸垂': mix({ lats: 50, biceps: 25, rhomboids: 10, forearms: 10, abs: 5 }),
    'チンニング': mix({ lats: 40, biceps: 35, rhomboids: 10, forearms: 10, abs: 5 }),
    'インバーテッドロウ': mix({ rhomboids: 30, lats: 30, rear_delts: 15, biceps: 15, forearms: 5, abs: 5 }),
    '自重スクワット': mix({ quads: 40, glutes: 30, hamstrings: 15, calves: 5, abs: 10 }),
    '自重ランジ': mix({ quads: 40, glutes: 30, hamstrings: 15, calves: 5, abs: 10 }),
    '自重カーフレイズ': mix({ calves: 90, quads: 10 }),
    'プランク': mix({ abs: 45, obliques: 25, glutes: 10, front_delts: 10, quads: 10 }),
    'サイドプランク': mix({ obliques: 60, abs: 15, glutes: 15, side_delts: 10 }),
    'クランチ': mix({ abs: 85, obliques: 10, hip_flexors: 5 }),
    'レッグレイズ': mix({ abs: 55, hip_flexors: 30, obliques: 10, quads: 5 }),
    'マウンテンクライマー': mix({ abs: 30, hip_flexors: 25, front_delts: 15, quads: 15, obliques: 10, calves: 5 }),
    'バーピー': mix({ quads: 20, glutes: 15, middle_chest: 15, hamstrings: 10, calves: 10, triceps: 10, front_delts: 10, abs: 10 }),

    'ケトルベルスイング': mix({ glutes: 35, hamstrings: 30, spinal_erectors: 15, abs: 10, forearms: 5, lats: 5 }),
    'ケトルベルゴブレットスクワット': mix({ quads: 45, glutes: 30, hamstrings: 10, abs: 10, forearms: 5 }),
    'ターキッシュゲットアップ': mix({ abs: 25, obliques: 20, front_delts: 15, side_delts: 10, triceps: 10, glutes: 10, quads: 10 }),
    'ケトルベルクリーン＆プレス': mix({ glutes: 20, quads: 15, front_delts: 15, triceps: 15, hamstrings: 10, side_delts: 10, traps: 10, forearms: 5 }),

    'アブローラー': mix({ abs: 55, obliques: 15, lats: 10, triceps: 10, front_delts: 10 }),
    '縄跳び': mix({ calves: 35, quads: 20, hamstrings: 10, glutes: 10, side_delts: 10, forearms: 10, abs: 5 }),
};

export const buildFallbackMuscleContributions = (targets: MuscleTarget[]): MuscleContribution[] => {
    const muscles = Array.from(new Set(targets.flatMap((target) => DETAILED_MUSCLE_GROUPS[target])));
    if (!muscles.length) return mix({ abs: 50, glutes: 50 });
    return muscles.map((muscle) => ({ muscle, share: 1 / muscles.length }));
};

export const getMuscleContributions = (
    name: string,
    targets: MuscleTarget[],
    stored?: MuscleContribution[],
) => stored?.length ? stored : STANDARD_MUSCLE_MIXES[name] ?? buildFallbackMuscleContributions(targets);

export const getSortedMuscleContributions = (
    name: string,
    targets: MuscleTarget[],
    stored?: MuscleContribution[],
) => [...getMuscleContributions(name, targets, stored)].sort((a, b) => b.share - a.share);

export const hasStandardMuscleProfile = (name: string) => Boolean(STANDARD_MUSCLE_MIXES[name]);
