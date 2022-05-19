// frameworks
import LogicGraph from "/emcJS/util/graph/LogicGraph.js";

import SettingsObserver from "../observer/SettingsObserver.js";

const logicDebugObserver = new SettingsObserver("debug_logic");

const LOGIC_PROCESSOR = new LogicGraph(logicDebugObserver.value != "off" && logicDebugObserver.value);
const CALL_TIMERS = new Map();

logicDebugObserver.addEventListener("change", event => {
    LOGIC_PROCESSOR.debug = event.value != "off" && event.value;
});

class TrackerLogic extends EventTarget {

    setLogic(logic, root) {
        if (logic) {
            LOGIC_PROCESSOR.clearGraph();
            LOGIC_PROCESSOR.load(logic);
            if (root != null) {
                if (!CALL_TIMERS.has(root)) {
                    CALL_TIMERS.set(root, setTimeout(() => {
                        const data = LOGIC_PROCESSOR.traverse(root);
                        if (Object.keys(data).length > 0) {
                            const ev = new Event("change");
                            ev.data = data;
                            this.dispatchEvent(ev);
                        }
                        CALL_TIMERS.delete(root);
                    }, 0));
                }
            }
        }
    }

    clearRedirects(root) {
        LOGIC_PROCESSOR.clearRedirects();
        if (root != null) {
            if (!CALL_TIMERS.has(root)) {
                CALL_TIMERS.set(root, setTimeout(() => {
                    const data = LOGIC_PROCESSOR.traverse(root);
                    if (Object.keys(data).length > 0) {
                        const ev = new Event("change");
                        ev.data = data;
                        this.dispatchEvent(ev);
                    }
                    CALL_TIMERS.delete(root);
                }, 0));
            }
        }
    }

    setRedirect(redirects, root) {
        if (Array.isArray(redirects)) {
            LOGIC_PROCESSOR.setAllRedirects(redirects);
        }
        if (root != null) {
            if (!CALL_TIMERS.has(root)) {
                CALL_TIMERS.set(root, setTimeout(() => {
                    const data = LOGIC_PROCESSOR.traverse(root);
                    if (Object.keys(data).length > 0) {
                        const ev = new Event("change");
                        ev.data = data;
                        this.dispatchEvent(ev);
                    }
                    CALL_TIMERS.delete(root);
                }, 0));
            }
        }
    }

    addReachable(target) {
        LOGIC_PROCESSOR.addReachable(target);
    }

    deleteReachable(target) {
        LOGIC_PROCESSOR.deleteReachable(target);
    }

    clearReachables() {
        LOGIC_PROCESSOR.clearReachables();
    }

    execute(data, root) {
        if (data) {
            LOGIC_PROCESSOR.setAll(data);
            if (root != null) {
                if (!CALL_TIMERS.has(root)) {
                    CALL_TIMERS.set(root, setTimeout(() => {
                        const data = LOGIC_PROCESSOR.traverse(root);
                        if (Object.keys(data).length > 0) {
                            const ev = new Event("change");
                            ev.data = data;
                            this.dispatchEvent(ev);
                        }
                        CALL_TIMERS.delete(root);
                    }, 0));
                }
            }
        }
    }

    reset() {
        LOGIC_PROCESSOR.reset();
    }

    getValue(ref) {
        return LOGIC_PROCESSOR.get(ref);
    }

    getAll() {
        return LOGIC_PROCESSOR.getAll();
    }

}

export default new TrackerLogic();
