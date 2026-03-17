/**
 * Recursively removes undefined values from an object or array.
 * Useful for cleaning data before sending to Firestore, which doesn't support undefined.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepCleanData = (data: any): any => {
    if (data === null || data === undefined) return data;
    
    if (Array.isArray(data)) {
        return data.map(v => deepCleanData(v)).filter(v => v !== undefined);
    }
    
    // Only clean plain objects to avoid iterating over internal Firestore objects
    const isPlainObject = typeof data === 'object' && (data.constructor === Object || data.constructor === undefined);

    if (isPlainObject && !(data instanceof Date) && !('seconds' in data && 'nanoseconds' in data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clean: Record<string, any> = {};
        Object.keys(data).forEach(key => {
            const value = deepCleanData(data[key]);
            if (value !== undefined) {
                clean[key] = value;
            }
        });
        return clean;
    }
    
    return data;
};
