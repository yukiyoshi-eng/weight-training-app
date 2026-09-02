import React from 'react';
import styles from './Input.module.css';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    help?: React.ReactNode;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, help, error, id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id ?? generatedId;
        return (
            <div className={styles.container}>
                {label && (
                    <div className={styles.labelRow}>
                        <label className={styles.label} htmlFor={inputId}>{label}</label>
                        {help}
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={clsx(styles.input, error && styles.hasError, className)}
                    {...props}
                />
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
