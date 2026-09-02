'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Trash2, AlertTriangle } from 'lucide-react';
import styles from './ResetDatabase.module.css';

export const ResetDatabase = () => {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm('本当にデータベースをリセットしますか？\nすべての記録が削除され、初期状態に戻ります。この操作は取り消せません。')) {
            return;
        }

        setIsResetting(true);
        try {
            await db.delete();
            window.location.reload();
        } catch (error) {
            console.error('Reset failed:', error);
            alert('リセットに失敗しました。');
            setIsResetting(false);
        }
    };

    return (
        <Card className={styles.container}>
            <h3 className={styles.title}>危険な操作</h3>
            <div className={styles.content}>
                <p className={styles.description}>
                    データベースを削除し、アプリを初期状態に戻します。
                    英語の種目データを日本語の初期データに置き換えたい場合などに使用してください。
                </p>
                <Button
                    onClick={handleReset}
                    isLoading={isResetting}
                    variant="destructive"
                    className={styles.button}
                >
                    <Trash2 size={16} style={{ marginRight: 8 }} />
                    データベースをリセット
                </Button>
            </div>
        </Card>
    );
};
