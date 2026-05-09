import {emptyState} from "../state/world/EmptyState.js";
import WorldStateManager from "./world/WorldStateManager.js";

const VALID_NAME = /[a-zA-Z0-9_./-]+/;
const STATE_MANAGERS = new Map();

class EmptyStateManager {

    has() {
        return false;
    }

    get() {
        return emptyState;
    }

    createState() {
        return emptyState;
    }

    getAll() {
        return {};
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                return {done: true};
            }
        };
    }

}

const emptyStateManager = new EmptyStateManager();

class WorldStateManagerRegistry {

    getEmpty() {
        return emptyState;
    }

    get(type) {
        if (!type || type === "0") {
            return emptyStateManager;
        }
        if (typeof type != "string") {
            throw new TypeError("type parameter must be a string");
        }
        if (!VALID_NAME.test(type)) {
            throw new Error("type parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
        const stateManager = STATE_MANAGERS.get(type);
        if (stateManager != null) {
            return stateManager;
        } else {
            console.warn(`StateManager for type "${type}" not initialized before usage`);
            return emptyStateManager;
        }
    }

    has(type) {
        return STATE_MANAGERS.has(type);
    }

    register(type, manager) {
        if (typeof type != "string") {
            throw new TypeError("type parameter must be a string");
        }
        if (!type) {
            throw new Error("type parameter must not be empty");
        }
        if (!VALID_NAME.test(type)) {
            throw new Error("type parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
        if (!(manager instanceof WorldStateManager)) {
            throw new TypeError("manager parameter must be an instance of WorldStateManager");
        }
        STATE_MANAGERS.set(type, manager);
    }

}

export default new WorldStateManagerRegistry();
