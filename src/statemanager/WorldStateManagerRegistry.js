import WorldResource from "../data/resource/WorldResource.js";
import {
    emptyState
} from "../state/world/EmptyState.js";
import WorldStateManager from "./world/WorldStateManager.js";

const VALID_NAME = /[a-zA-Z0-9_./-]+/;
const CONFIG = WorldResource.get("config");
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
        }
    }

}

const emptyStateManager = new EmptyStateManager();

class WorldStateManagerRegistry {

    getEmpty() {
        return emptyState;
    }

    get(category) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (!category || category == "\u0000") {
            return emptyStateManager;
        }
        const stateManager = STATE_MANAGERS.get(category);
        if (stateManager != null) {
            return stateManager;
        } else {
            console.warn(`StateManager for category "${category}" not initialized before usage`);
            return emptyStateManager;
        }
    }

    has(category) {
        return STATE_MANAGERS.has(category);
    }

    register(category, manager) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (!category) {
            throw new Error("category parameter must not be empty");
        }
        if (!VALID_NAME.test(category)) {
            throw new Error("category parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
        if (!(manager instanceof WorldStateManager)) {
            throw new TypeError(`manager parameter must be an instance of WorldStateManager`);
        }
        STATE_MANAGERS.set(category, manager);
    }

}

if (CONFIG.prefetchEntries) {
    setTimeout(() => {
        for (const [category, manager] of STATE_MANAGERS) {
            const data = WorldResource.get(category);

            for (const id in data) {
                manager.get(id);
            }
        }
    }, 0);
}

export default new WorldStateManagerRegistry();
