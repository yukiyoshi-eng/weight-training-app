'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { Activity, CalendarDays, Flame, Trophy } from 'lucide-react';
import { db } from '@/lib/db';
import { filterSessionsByDays, summarizeTraining } from '@/lib/analytics';
import { TermHelp } from '@/components/ui/TermHelp';
import { TERM_DEFINITIONS } from '@/lib/terms';
import styles from './TrainingSummary.module.css';

export const TrainingSummary = ({ days }: { days: number | null }) => {
    const summary = useLiveQuery(async () => {
        const allSessions = await db.sessions.filter((session) => Boolean(session.endTime)).toArray();
        const sessions = filterSessionsByDays(allSessions, days);
        const bundles = await Promise.all(sessions.map(async (session) => ({
            session,
            sets: await db.sets.where('sessionId').equals(session.id!).toArray(),
        })));
        const exercises = await db.exercises.toArray();
        return summarizeTraining(bundles, new Map(exercises.map((exercise) => [exercise.id!, exercise])));
    }, [days]);

    const cards = [
        { label: 'トレーニング', value: summary?.sessions ?? 0, suffix: '回', icon: CalendarDays },
        { label: '総負荷', value: Math.round(summary?.totalLoad ?? 0).toLocaleString(), suffix: '', icon: Activity, help: TERM_DEFINITIONS.totalLoad },
        { label: '最高重量', value: summary?.maxWeight ?? 0, suffix: 'kg', icon: Trophy },
        { label: 'ストリーク', value: summary?.streak ?? 0, suffix: '日', icon: Flame, help: TERM_DEFINITIONS.streak },
    ];

    return (
        <section className={styles.grid} aria-label="トレーニング概要">
            {cards.map(({ label, value, suffix, icon: Icon, help }) => (
                <div key={label} className={styles.card}>
                    <Icon size={18} aria-hidden="true" />
                    <div className={styles.labelRow}>
                        <span className={styles.label}>{label}</span>
                        {help && <TermHelp definition={help} align="end" />}
                    </div>
                    <strong>{value}<small>{suffix}</small></strong>
                </div>
            ))}
        </section>
    );
};
