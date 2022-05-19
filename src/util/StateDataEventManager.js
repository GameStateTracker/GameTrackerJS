import DataState from "../state/DataState.js";

const TARGET = new WeakMap();
const SUBS = new WeakMap();

export default class StateDataEventManager {

    constructor() {
        SUBS.set(this, new Map());
        TARGET.set(this, null);
    }

    switchState(newTarget) {
        const subs = SUBS.get(this);
        const oldTarget = TARGET.get(this);
        if (oldTarget != null) {
            subs.forEach(function(fn, name) {
                oldTarget.removeEventListener(name, fn);
            });
        }
        TARGET.set(this, newTarget);
        if (newTarget instanceof DataState) {
            subs.forEach(function(fn, name) {
                newTarget.addEventListener(name, fn);
            });
        }
    }

    getState() {
        return TARGET.get(this);
    }

    registerStateHandler(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.registerStateHandler(n, fn));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    target.removeEventListener(name, fn);
                }
                target.addEventListener(name, fn);
            }
            subs.set(name, fn);
        }
    }

    unregisterStateHandler(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.unregisterStateHandler(n, fn));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    target.removeEventListener(name, fn);
                    subs.delete(name);
                }
            }
        }
    }

}
