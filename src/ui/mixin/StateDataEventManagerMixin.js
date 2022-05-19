// frameworks
import {
    createMixin
} from "/emcJS/util/Mixin.js";

import DataState from "../../state/DataState.js";

const TARGET = new WeakMap();
const SUBS = new WeakMap();

export default createMixin((superclass) => class StateDataEventManagerMixin extends superclass {

    constructor(...args) {
        super(...args);
        SUBS.set(this, new Map());
        TARGET.set(this, null);
    }

    switchState(newTarget) {
        const subs = SUBS.get(this);
        const oldTarget = TARGET.get(this);
        if (newTarget instanceof DataState) {
            if (oldTarget != newTarget) {
                if (oldTarget != null) {
                    subs.forEach(function(fns, name) {
                        fns.forEach(function(fn) {
                            oldTarget.removeEventListener(name, fn);
                        });
                    });
                }
                TARGET.set(this, newTarget);
                if (this.isConnected) {
                    subs.forEach(function(fns, name) {
                        fns.forEach(function(fn) {
                            newTarget.addEventListener(name, fn);
                        });
                    });
                    this.applyStateValues(newTarget);
                }
            }
        } else {
            if (oldTarget != null) {
                subs.forEach(function(fns, name) {
                    fns.forEach(function(fn) {
                        oldTarget.removeEventListener(name, fn);
                    });
                });
            }
            TARGET.set(this, null);
            if (this.isConnected) {
                this.applyDefaultValues();
            }
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
            if (!subs.has(name)) {
                subs.set(name, new Set());
            }
            const fns = subs.get(name);
            fns.add(fn);
            if (target != null && this.isConnected) {
                target.addEventListener(name, fn);
            }
        }
    }

    unregisterStateHandler(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.unregisterStateHandler(n, fn));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (subs.has(name)) {
                const fns = subs.get(name);
                if (fns.has(fn)) {
                    subs.delete(name);
                }
            }
            if (target != null) {
                target.removeEventListener(name, fn);
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const target = TARGET.get(this);
        if (target != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fns, name) {
                fns.forEach(function(fn) {
                    target.addEventListener(name, fn);
                });
            });
            this.applyStateValues(target);
        } else {
            this.applyDefaultValues();
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const target = TARGET.get(this);
        if (target != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fns, name) {
                fns.forEach(function(fn) {
                    target.removeEventListener(name, fn);
                });
            });
        }
    }

    applyDefaultValues() {
        // empty
    }

    applyStateValues(state) {
        // empty
    }

});
