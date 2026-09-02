'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HistoryCalendar.module.css';
import { clsx } from 'clsx';

interface HistoryCalendarProps {
    onSelectDate: (date: string) => void;
    selectedDate: string;
}

export const HistoryCalendar = ({ onSelectDate, selectedDate }: HistoryCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const sessions = useLiveQuery(
        () => db.sessions.toArray()
    );

    const trainingDates = new Set(sessions?.map(s => s.date));

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onSelectDate(dateStr);
    };

    const renderCalendarDays = () => {
        const daysArray = [];
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
        }
        for (let i = 1; i <= days; i++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasTraining = trainingDates.has(dateStr);
            const isSelected = dateStr === selectedDate;

            daysArray.push(
                <button
                    key={i}
                    className={clsx(
                        styles.day,
                        hasTraining && styles.hasTraining,
                        isSelected && styles.selected
                    )}
                    onClick={() => handleDateClick(i)}
                    aria-label={`${dateStr}${hasTraining ? ' トレーニングあり' : ''}`}
                >
                    {i}
                    {hasTraining && <div className={styles.dot} />}
                </button>
            );
        }
        return daysArray;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="前の月">
                    <ChevronLeft size={20} />
                </Button>
                <h3 className={styles.monthTitle}>
                    {currentMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="次の月">
                    <ChevronRight size={20} />
                </Button>
            </div>
            <div className={styles.weekdays}>
                {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                    <div key={i} className={styles.weekday}>{d}</div>
                ))}
            </div>
            <div className={styles.grid}>
                {renderCalendarDays()}
            </div>
        </div>
    );
};
