import { CircleHelp } from 'lucide-react';
import type { TermDefinition } from '@/lib/terms';
import styles from './TermHelp.module.css';

type TermHelpProps = {
    definition: TermDefinition;
    align?: 'start' | 'end';
};

export const TermHelp = ({ definition, align = 'start' }: TermHelpProps) => (
    <details className={`${styles.help} ${align === 'end' ? styles.alignEnd : ''}`}>
        <summary aria-label={`${definition.term}の説明を表示`}>
            <CircleHelp size={16} aria-hidden="true" />
        </summary>
        <div className={styles.popover} role="note">
            <strong>{definition.term}</strong>
            <p>{definition.description}</p>
            {definition.example && <small>{definition.example}</small>}
        </div>
    </details>
);
