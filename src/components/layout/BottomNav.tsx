'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Calendar, BarChart2, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';
import { clsx } from 'clsx';

export const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'ホーム', icon: Home },
        { href: '/exercises', label: '種目', icon: Dumbbell },
        { href: '/history', label: '履歴', icon: Calendar },
        { href: '/analysis', label: '分析', icon: BarChart2 },
        { href: '/settings', label: '設定', icon: Settings },
    ];

    return (
        <nav className={styles.nav}>
            {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={clsx(styles.item, isActive && styles.active)}
                    >
                        <Icon size={24} className={styles.icon} />
                        <span className={styles.label}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};
