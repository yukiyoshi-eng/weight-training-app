import { Card } from '@/components/ui/Card';
import { GLOSSARY_TERMS } from '@/lib/terms';
import styles from './GlossaryCard.module.css';

export const GlossaryCard = () => (
    <Card className={styles.container}>
        <h3>用語ガイド</h3>
        <div className={styles.list}>
            {GLOSSARY_TERMS.map((definition) => (
                <details key={definition.term} className={styles.item}>
                    <summary>{definition.term}</summary>
                    <p>{definition.description}</p>
                    {definition.example && <small>{definition.example}</small>}
                </details>
            ))}
        </div>
    </Card>
);
