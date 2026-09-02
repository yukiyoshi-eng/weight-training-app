'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { Play, TrendingUp, Calendar } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const recentSessions = useLiveQuery(
    () => db.sessions.orderBy('date').reverse().limit(3).toArray()
  );

  const weeklyCount = useLiveQuery(async () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0];
    return db.sessions.where('date').aboveOrEqual(oneWeekAgo).count();
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>おかえりなさい</h1>
        <p className={styles.subtitle}>今日もトレーニングを頑張りましょう！</p>
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
            <span className={styles.statLabel}>今週のワークアウト</span>
          </div>
        </Card>
      </section>

      <section className={styles.recentSection}>
        <h3 className={styles.sectionTitle}>最近のアクティビティ</h3>
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
