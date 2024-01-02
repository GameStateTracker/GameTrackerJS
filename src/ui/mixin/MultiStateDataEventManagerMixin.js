// frameworks
import {
    createMixin
} from "/emcJS/util/Mixin.js";

import DataState from "../../state/DataState.js";

export default createMixin((superclass) => class MultiStateDataEventManagerMixin extends superclass {

    #targets = new Set();

    #subs = new Map();

    #getSubs(name) {
        if (!this.#subs.has(name)) {
            const res = new Set();
            this.#subs.set(name, res);
            return res;
        }
        return this.#subs.get(name);
    }

    addState(target) {
        if (target == null || !(target instanceof DataState)) {
            throw new TypeError("target must be an instance of DataState");
        }
        if (!this.#targets.has(target)) {
            this.#targets.add(target);
            if (this.isConnected) {
                for (const [name, fns] of this.#subs) {
                    for (const fn of fns) {
                        target.addEventListener(name, fn);
                    }
                }
                this.applyStateValues(Array.from(this.#targets));
            }
        }
    }

    removeState(target) {
        if (target == null || !(target instanceof DataState)) {
            throw new TypeError("target must be an instance of DataState");
        }
        if (this.#targets.has(target)) {
            this.#targets.delete(target);
            for (const [name, fns] of this.#subs) {
                for (const fn of fns) {
                    target.removeEventListener(name, fn);
                }
            }
        }
        if (this.isConnected && this.#targets.size <= 0) {
            this.applyDefaultValues();
        }
    }

    clearStates() {
        for (const target of this.#targets) {
            for (const [name, fns] of this.#subs) {
                for (const fn of fns) {
                    target.removeEventListener(name, fn);
                }
            }
        }
        this.#targets.clear();
        this.applyDefaultValues();
    }

    getStates() {
        return Array.from(this.#targets);
    }

    registerStateHandler(name, fn) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.registerStateHandler(n, fn)
            }
        } else {
            const fns = this.#getSubs(name);
            if (!fns.has(fn)) {
                fns.add(fn);
                for (const target of this.#targets) {
                    if (this.isConnected) {
                        target.addEventListener(name, fn);
                    }
                }
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
            if (fns.has(fn)) {
                fns.delete(fn);
                for (const target of this.#targets) {
                    target.removeEventListener(name, fn);
                }
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        if (this.#targets.size <= 0) {
            this.applyDefaultValues();
        } else {
            for (const target of this.#targets) {
                for (const [name, fns] of this.#subs) {
                    for (const fn of fns) {
                        target.addEventListener(name, fn);
                    }
                }
            }
            this.applyStateValues(Array.from(this.#targets));
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        for (const target of this.#targets) {
            for (const [name, fns] of this.#subs) {
                for (const fn of fns) {
                    target.removeEventListener(name, fn);
                }
            }
        }
    }

    applyDefaultValues() {
        // empty
    }

    applyStateValues(/* state */) {
        // empty
    }

});
