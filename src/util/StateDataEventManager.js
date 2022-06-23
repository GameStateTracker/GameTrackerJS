import DataState from "../state/DataState.js";

export default class StateDataEventManager {

    #target = null;

    #subs = new Map();

    #getSubs(name) {
        if (!this.#subs.has(name)) {
            const res = new Set();
            this.#subs.set(name, res);
            return res;
        }
        return this.#subs.get(name);
    }

    switchState(target) {
        if (this.#target != target) {
            // clean up
            if (this.#target != null) {
                for (const [name, fns] of this.#subs) {
                    for (const fn of fns) {
                        this.#target.removeEventListener(name, fn);
                    }
                }
            }
            if (target instanceof DataState) {
                // register new
                if (this.#target != target) {
                    this.#target = target;
                    for (const [name, fns] of this.#subs) {
                        for (const fn of fns) {
                            this.#target.addEventListener(name, fn);
                        }
                    }
                }
            } else {
                // remove
                this.#target = null;
            }
        }
    }

    getState() {
        return this.#target;
    }

    registerStateHandler(name, fn) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.registerStateHandler(n, fn)
            }
        } else {
            const fns = this.#getSubs(name);
            fns.add(fn);
            if (this.#target != null && this.isConnected) {
                this.#target.addEventListener(name, fn);
            }
        }
    }

    unregisterStateHandler(name, fn) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.unregisterStateHandler(n, fn)
            }
        } else {
            const fns = this.#getSubs(name);
            fns.delete(fn);
            if (this.#target != null) {
                this.#target.removeEventListener(name, fn);
            }
        }
    }

}
