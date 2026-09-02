'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculateSetLoad, filterSessionsByDays } from '@/lib/analytics';
import { formatDateKey } from '@/lib/date';
import styles from './VolumeChart.module.css';

type Metric = 'volume' | 'maxWeight';

export const VolumeChart = ({ days }: { days: number | null }) => {
    const [metric, setMetric] = useState<Metric>('volume');
    const data = useLiveQuery(async () => {
        const sessions = filterSessionsByDays(
            await db.sessions.filter((session) => Boolean(session.endTime)).toArray(),
            days,
        ).sort((a, b) => a.date.localeCompare(b.date));
        const exercises = await db.exercises.toArray();
        const exerciseById = new Map(exercises.map((exercise) => [exercise.id!, exercise]));

        return Promise.all(sessions.map(async (session) => {
            const sets = await db.sets.where('sessionId').equals(session.id!).toArray();
            return {
                date: formatDateKey(session.date),
                volume: Math.round(sets.reduce(
                    (total, set) => total + calculateSetLoad(set, exerciseById.get(set.exerciseId)),
                    0,
                )),
                maxWeight: Math.max(0, ...sets.map((set) => set.weight ?? 0)),
            };
        }));
    }, [days]);

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{metric === 'volume' ? '総負荷の推移' : '最高重量の推移'}</h3>
                <div className={styles.metricSwitch}>
                    <button className={metric === 'volume' ? styles.active : ''} onClick={() => setMetric('volume')} aria-pressed={metric === 'volume'}>負荷</button>
                    <button className={metric === 'maxWeight' ? styles.active : ''} onClick={() => setMetric('maxWeight')} aria-pressed={metric === 'maxWeight'}>重量</button>
                </div>
            </div>
            {!data?.length ? (
                <div className={styles.empty}>この期間のデータはありません。</div>
            ) : (
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={220} minWidth={0}>
                        <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="var(--text-secondary)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => metric === 'volume' && value >= 1000 ? `${value / 1000}k` : `${value}`}
                            />
                            <Tooltip
                                formatter={(value) => [metric === 'maxWeight' ? `${value}kg` : Number(value).toLocaleString(), metric === 'maxWeight' ? '最高重量' : '総負荷']}
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Area type="monotone" dataKey={metric} stroke="var(--primary)" fill="url(#colorMetric)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
};
