import DataState from "../DataState.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

export default class EmptyState extends DataState {

    constructor() {
        super("_", {});
    }

    get ref() {
        return "\u0000";
    }

    setAccess() {
        // empty
    }

    generateList() {
        // empty
    }

    getList() {
        return [];
    }

    getFilteredList() {
        return [];
    }

    get areaData() {
        return {};
    }

    get defaultAccess() {
        return {
            done: 0,
            unopened: 0,
            reachable: 0,
            total: 0,
            value: AccessStateEnum.OPENED,
            entrances: 0
        };
    }

    get access() {
        return this.defaultAccess;
    }

    get visible() {
        return false;
    }

    get filtered() {
        return true;
    }

    isVisible() {
        return false;
    }

}

export const emptyState = new EmptyState();
