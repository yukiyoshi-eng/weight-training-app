export type TermDefinition = {
    term: string;
    description: string;
    example?: string;
};

export const TERM_DEFINITIONS = {
    rpe: {
        term: 'RPE',
        description: 'そのセットがどれくらいきつかったかを、1〜10で表す主観的な強度です。',
        example: 'RPE 8は「あと2回ほどできそう」、RPE 10は「もう1回もできない」が目安です。',
    },
    totalLoad: {
        term: '総負荷',
        description: 'トレーニング量を見るための目安です。重量種目は「重量 × 回数」を全セット分合計します。',
        example: '自重種目は回数、時間種目は秒数を目安として加算するため、同じ種目・メニュー内の推移を見るのに適しています。',
    },
    streak: {
        term: 'ストリーク',
        description: '途切れずにトレーニングを記録した連続日数です。今日または昨日まで続いている記録を数えます。',
    },
    json: {
        term: 'JSON',
        description: 'アプリの記録をまとめて保存できる、一般的なテキスト形式です。',
        example: '機種変更やブラウザデータ削除に備えたバックアップとして使えます。',
    },
    offline: {
        term: 'オフライン',
        description: 'インターネットに接続していない状態です。一度アプリを開いた後は、通信なしでも記録を続けられます。',
    },
} satisfies Record<string, TermDefinition>;

export const GLOSSARY_TERMS: TermDefinition[] = Object.values(TERM_DEFINITIONS);
