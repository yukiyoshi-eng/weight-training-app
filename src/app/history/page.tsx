'use client';

import React, { useState } from 'react';
import { HistoryCalendar } from '@/components/features/HistoryCalendar';
import { SessionList } from '@/components/features/SessionList';
import { toLocalDateKey } from '@/lib/date';

export default function HistoryPage() {
    const [selectedDate, setSelectedDate] = useState(toLocalDateKey());

    return (
        <main style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>履歴</h2>
            <HistoryCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />
            <h3 style={{ marginBottom: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                {new Date(selectedDate).toLocaleDateString('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <SessionList date={selectedDate} />
        </main>
    );
}
