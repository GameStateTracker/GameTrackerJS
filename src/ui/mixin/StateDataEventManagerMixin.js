import {createMixin} from "@emcjs/core/mixin/Mixin.js";
import EntityState from "@emcjs/core/data/state/entity/EntityState.js";

export default createMixin((superclass) => class StateDataEventManagerMixin extends superclass {

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
            if (target instanceof EntityState) {
                // register new
                if (this.#target != target) {
                    this.#target = target;
                    if (this.isConnected) {
                        for (const [name, fns] of this.#subs) {
                            for (const fn of fns) {
                                this.#target.addEventListener(name, fn);
                            }
                        }
                        this.applyStateValues(target);
                    }
                }
            } else {
                // remove
                this.#target = null;
                if (this.isConnected) {
                    this.applyDefaultValues();
                }
            }
        }
    }

    getState() {
        return this.#target;
    }

    registerStateHandler(name, fn) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.registerStateHandler(n, fn);
            }
        } else {
            const fns = this.#getSubs(name);
            if (!fns.has(fn)) {
                fns.add(fn);
                if (this.#target != null && this.isConnected) {
                    this.#target.addEventListener(name, fn);
                }
            }
        }
    }

    unregisterStateHandler(name, fn) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.unregisterStateHandler(n, fn);
            }
        } else {
            const fns = this.#getSubs(name);
            if (fns.has(fn)) {
                fns.delete(fn);
                if (this.#target != null) {
                    this.#target.removeEventListener(name, fn);
                }
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback?.();
        }
        if (this.#target != null) {
            for (const [name, fns] of this.#subs) {
                for (const fn of fns) {
                    this.#target.addEventListener(name, fn);
                }
            }
            this.applyStateValues(this.#target);
        } else {
            this.applyDefaultValues();
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback?.();
        }
        if (this.#target != null) {
            for (const [name, fns] of this.#subs) {
                for (const fn of fns) {
                    this.#target.removeEventListener(name, fn);
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
