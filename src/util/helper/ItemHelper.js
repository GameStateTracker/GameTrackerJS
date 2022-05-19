export function parseSafeRange(value, def) {
    const result = parseInt(value);
    if (isNaN(result)) {
        return def;
    }
    if (result > 99999) {
        return 99999;
    }
    if (result < 0) {
        return 0;
    }
    return result;
}
