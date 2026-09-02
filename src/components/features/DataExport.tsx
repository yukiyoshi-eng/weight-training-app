'use client';

import React, { useRef, useState } from 'react';
import { db } from '@/lib/db';
import type { EquipmentType, Exercise } from '@/lib/db';
import { DEFAULT_EXERCISES } from '@/lib/exerciseCatalog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Upload } from 'lucide-react';
import styles from './DataExport.module.css';

export const DataExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exercises = await db.exercises.toArray();
            const sessions = await db.sessions.toArray();
            const sets = await db.sets.toArray();
            const goals = await db.goals.toArray();

            const data = {
                version: 2,
                timestamp: new Date().toISOString(),
                exercises,
                sessions,
                sets,
                goals
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `weight-training-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const data = JSON.parse(await file.text());
            if (![1, 2].includes(data.version) || !Array.isArray(data.exercises) || !Array.isArray(data.sessions) || !Array.isArray(data.sets)) {
                throw new Error('Invalid backup');
            }
            if (!confirm('現在のデータをバックアップ内容で置き換えますか？')) return;
            const catalogByName = new Map(DEFAULT_EXERCISES.map((item) => [item.name, item]));
            const backupExercises = data.exercises as Array<Omit<Exercise, 'equipment'> & { equipment?: EquipmentType }>;
            const importedExercises: Exercise[] = backupExercises.map((item) => ({
                ...item,
                equipment: item.equipment ?? catalogByName.get(item.name)?.equipment ?? 'other',
            }));
            const importedNames = new Set(importedExercises.map((item) => item.name));
            const missingDefaults = DEFAULT_EXERCISES.filter((item) => !importedNames.has(item.name));
            await db.transaction('rw', db.exercises, db.sessions, db.sets, db.goals, async () => {
                await Promise.all([db.exercises.clear(), db.sessions.clear(), db.sets.clear(), db.goals.clear()]);
                await db.exercises.bulkPut(importedExercises);
                if (missingDefaults.length) await db.exercises.bulkAdd(missingDefaults);
                await db.sessions.bulkPut(data.sessions);
                await db.sets.bulkPut(data.sets);
                if (Array.isArray(data.goals)) await db.goals.bulkPut(data.goals);
            });
            setMessage('バックアップを復元しました。');
        } catch {
            setMessage('このファイルは復元できません。');
        } finally {
            event.target.value = '';
        }
    };

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>データ管理</h3>
            <div className={styles.actions}>
                <Button onClick={handleExport} isLoading={isExporting} variant="secondary" className={styles.button}>
                    <Download size={16} style={{ marginRight: 8 }} />
                    データのエクスポート (JSON)
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImport}
                    className={styles.fileInput}
                    aria-label="バックアップファイルを選択"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className={styles.button}>
                    <Upload size={16} style={{ marginRight: 8 }} />
                    バックアップを復元
                </Button>
            </div>
            {message && <p className={styles.message} role="status">{message}</p>}
        </Card>
    );
};
