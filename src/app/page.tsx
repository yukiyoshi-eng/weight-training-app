'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { Play, TrendingUp, Calendar } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { dateKeyDaysAgo } from '@/lib/date';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const recentSessions = useLiveQuery(
    () => db.sessions.filter((session) => Boolean(session.endTime)).reverse().limit(3).toArray()
  );

  const weeklyCount = useLiveQuery(async () => {
    const oneWeekAgo = dateKeyDaysAgo(6);
    return db.sessions.where('date').aboveOrEqual(oneWeekAgo).filter((session) => Boolean(session.endTime)).count();
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>LOCAL-FIRST TRAINING LOG</span>
        <h1 className={styles.title}>LiftLog</h1>
        <p className={styles.subtitle}>今日の一歩を、次の成長につなげよう。</p>
      </header>

      <section className={styles.actionSection}>
        <Button
          size="lg"
          className={styles.startBtn}
          onClick={() => router.push('/record')}
        >
          <Play fill="currentColor" style={{ marginRight: 8 }} />
          トレーニング開始
        </Button>
      </section>

      <section className={styles.statsSection}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} color="var(--secondary)" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{weeklyCount || 0}</span>
            <span className={styles.statLabel}>今週のトレーニング</span>
          </div>
        </Card>
      </section>

      <section className={styles.recentSection}>
        <h3 className={styles.sectionTitle}>最近の記録</h3>
        <div className={styles.recentList}>
          {recentSessions?.map(session => (
            <Card key={session.id} className={styles.recentItem}>
              <Calendar size={16} className={styles.recentIcon} />
              <div className={styles.recentInfo}>
                <span className={styles.recentDate}>{session.date}</span>
                <span className={styles.recentTime}>
                  {session.startTime ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </Card>
          ))}
          {(!recentSessions || recentSessions.length === 0) && (
            <p className={styles.empty}>最近の記録はありません。</p>
          )}
        </div>
      </section>
    </main>
  );
}
