import AccessStateEnum from "../../enum/AccessStateEnum.js";

export function getDefaultAccess() {
    return {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED,
        entrances: 0,
        locations: new Map()
    };
}

export function getSummaryDefaultAccess() {
    return {
        done_min: 0,
        done_max: 0,
        unopened_min: 0,
        unopened_max: 0,
        reachable_min: 0,
        reachable_max: 0,
        total_min: 0,
        total_max: 0,
        value: AccessStateEnum.OPENED
    };
}

export function getListAccessValueAll(accessData) {
    if (accessData.some((access) => access.value === AccessStateEnum.UNAVAILABLE)) {
        return AccessStateEnum.UNAVAILABLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.POSSIBLE)) {
        return AccessStateEnum.POSSIBLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.AVAILABLE)) {
        return AccessStateEnum.AVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

export function getListAccessValueOne(accessData) {
    if (accessData.some((access) => access.value === AccessStateEnum.AVAILABLE)) {
        return AccessStateEnum.AVAILABLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.POSSIBLE)) {
        return AccessStateEnum.POSSIBLE;
    }
    if (accessData.some((access) => access.value === AccessStateEnum.UNAVAILABLE)) {
        return AccessStateEnum.UNAVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

export function getListAccess(accessData, needAll = false) {
    if (needAll) {
        return {
            done: Math.min(...accessData.map((access) => access.done)),
            unopened: Math.min(...accessData.map((access) => access.unopened)),
            reachable: Math.min(...accessData.map((access) => access.reachable)),
            total: Math.min(...accessData.map((access) => access.total)),
            entrances: accessData.all((access) => access.entrances),
            value: getListAccessValueAll(accessData)
        };
    } else {
        return {
            done: Math.max(...accessData.map((access) => access.done)),
            unopened: Math.max(...accessData.map((access) => access.unopened)),
            reachable: Math.max(...accessData.map((access) => access.reachable)),
            total: Math.max(...accessData.map((access) => access.total)),
            entrances: accessData.some((access) => access.entrances),
            value: getListAccessValueOne(accessData)
        };
    }
}

export function getMultiListAccess(accessData, needAll = false) {
    const value = needAll ? getListAccessValueAll(accessData) : getListAccessValueOne(accessData);
    return {
        done_min: Math.min(...accessData.map((access) => access.done)),
        done_max: Math.max(...accessData.map((access) => access.done)),
        unopened_min: Math.min(...accessData.map((access) => access.unopened)),
        unopened_max: Math.max(...accessData.map((access) => access.unopened)),
        reachable_min: Math.min(...accessData.map((access) => access.reachable)),
        reachable_max: Math.max(...accessData.map((access) => access.reachable)),
        total_min: Math.min(...accessData.map((access) => access.total)),
        total_max: Math.max(...accessData.map((access) => access.total)),
        value
    };
}

export function getListSummaryAccess(accessData, needAll = false) {
    const value = needAll ? getListAccessValueAll(accessData) : getListAccessValueOne(accessData);
    const result = {
        done_min: 0,
        done_max: 0,
        unopened_min: 0,
        unopened_max: 0,
        reachable_min: 0,
        reachable_max: 0,
        total_min: 0,
        total_max: 0,
        value
    };

    for (const access of accessData) {
        result.done_min += access.done_min ?? access.done ?? 0;
        result.done_max += access.done_max ?? access.done ?? 0;
        result.unopened_min += access.unopened_min ?? access.unopened ?? 0;
        result.unopened_max += access.unopened_max ?? access.unopened ?? 0;
        result.reachable_min += access.reachable_min ?? access.reachable ?? 0;
        result.reachable_max += access.reachable_max ?? access.reachable ?? 0;
        result.total_min += access.total_min ?? access.total ?? 0;
        result.total_max += access.total_max ?? access.total ?? 0;
    }

    return result;
}
