import React from 'react';
import styles from './Card.module.css';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(styles.card, className)} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
