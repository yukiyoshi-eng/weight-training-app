'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Trash2 } from 'lucide-react';
import styles from './ResetDatabase.module.css';

export const ResetDatabase = () => {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm('アプリの全データを削除して初期状態に戻しますか？\nこの操作は取り消せません。')) {
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
                    この端末に保存したトレーニング記録、カスタム種目、設定をすべて削除します。
                    必要な記録は、先にバックアップを書き出してください。
                </p>
                <Button
                    onClick={handleReset}
                    isLoading={isResetting}
                    variant="destructive"
                    className={styles.button}
                >
                    <Trash2 size={16} style={{ marginRight: 8 }} />
                    すべてのデータを削除
                </Button>
            </div>
        </Card>
    );
};
