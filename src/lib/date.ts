export const toLocalDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const dateKeyDaysAgo = (days: number, now = new Date()) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    return toLocalDateKey(date);
};

export const formatDateKey = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
    });
};
