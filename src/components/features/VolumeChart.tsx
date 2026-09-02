'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import styles from './VolumeChart.module.css';

export const VolumeChart = () => {
    const data = useLiveQuery(async () => {
        const sessions = await db.sessions.orderBy('date').toArray();
        const chartData = await Promise.all(sessions.map(async (session) => {
            const sets = await db.sets.where('sessionId').equals(session.id!).toArray();
            const volume = sets.reduce((acc, set) => acc + (set.weight || 0) * (set.reps || 0), 0);
            return {
                date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                volume
            };
        }));
        return chartData;
    });

    if (!data || data.length === 0) {
        return (
            <Card className={styles.container}>
                <h3 className={styles.title}>ボリューム推移</h3>
                <div className={styles.empty}>データがまだありません。</div>
            </Card>
        );
    }

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>ボリューム推移</h3>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: 'var(--primary)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="var(--primary)"
                            fillOpacity={1}
                            fill="url(#colorVolume)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
