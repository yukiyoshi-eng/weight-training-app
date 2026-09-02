'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Upload } from 'lucide-react';
import styles from './DataExport.module.css';

export const DataExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exercises = await db.exercises.toArray();
            const sessions = await db.sessions.toArray();
            const sets = await db.sets.toArray();
            const goals = await db.goals.toArray();

            const data = {
                version: 1,
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

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>データ管理</h3>
            <div className={styles.actions}>
                <Button onClick={handleExport} isLoading={isExporting} variant="secondary" className={styles.button}>
                    <Download size={16} style={{ marginRight: 8 }} />
                    データのエクスポート (JSON)
                </Button>
                {/* Import functionality could be added here */}
            </div>
        </Card>
    );
};
