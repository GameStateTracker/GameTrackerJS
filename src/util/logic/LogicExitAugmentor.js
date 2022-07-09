
import OptionsObserver from "../observer/OptionsObserver.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import Logic from "./Logic.js";
import WorldResource from "../../data/resource/WorldResource.js";

const CONFIG = WorldResource.get("config");
const GATEWAYS_PREFIX_IN = CONFIG.gateways?.incoming?.prefix ?? "";
const GATEWAYS_POSTFIX_IN = CONFIG.gateways?.incoming?.postfix ?? "";
const GATEWAYS_PREFIX_OUT = CONFIG.gateways?.outgoing?.prefix ?? "";
const GATEWAYS_POSTFIX_OUT = CONFIG.gateways?.outgoing?.postfix ?? "";
const GATEWAYS_VARIANTS = CONFIG.gateways?.variants;

const detachedEntrancesObserver = new OptionsObserver("detached_entrances");

const INSTANCES = new Map();

function checkForBindingCorrections(exit, newValue, oldValue) {
    if (!detachedEntrancesObserver.value) {
        const oldInstance = INSTANCES.get(oldValue);
        if (oldInstance != null) {
            const oldExit = oldInstance.exit;
            if (exit.ref == oldExit.ref) {
                // leave it as is
            } else if (exit.props.isBiDir) {
                if (oldExit.value == exit.ref) {
                    oldExit.value = "";
                }
            }
        }
        const newInstance = INSTANCES.get(newValue);
        if (newInstance != null) {
            const newEntrance = newInstance.exit;
            if (exit.ref == newEntrance.ref) {
                exit.value = "";
            } else if (exit.props.isBiDir) {
                if (newEntrance.value != "") {
                    const otherEntrance = INSTANCES.get(newEntrance.value);
                    if (otherEntrance != null) {
                        otherEntrance.value = "";
                    }
                }
                newEntrance.value = exit.ref;
            }
        }
    }
}

export default class LogicExitAugmentor {

    #exit = null;

    constructor(ref) {
        INSTANCES.set(ref, this);

        /* EXIT */
        this.#exit = ExitStateManager.get(ref);
        this.#exit.addEventListener("visible", () => {
            this.#changeBinding();
        });
        this.#exit.addEventListener("value", (event) => {
            checkForBindingCorrections(this.#exit, event.newValue, event.oldValue);
            this.#changeBinding();
        });
        this.#changeBinding();
    }

    #changeBinding() {
        const changes = [];
        if (this.#exit.visible) {
            LogicExitAugmentor.applyBinding(changes, this.#exit.ref, this.#exit.value);
        } else {
            LogicExitAugmentor.applyBinding(changes, this.#exit.ref, null);
        }
        if (changes.length) {
            Logic.setRedirect(changes, "region[root]");
        }
    }

    get exit() {
        return this.#exit;
    }

    static applyBinding(changes, from, to) {
        const [source, target] = from.split(" -> ");
        const sourceVal = `region[${GATEWAYS_PREFIX_IN}${source}${GATEWAYS_POSTFIX_IN}]`;
        const targetVal = `region[${GATEWAYS_PREFIX_OUT}${target}${GATEWAYS_POSTFIX_OUT}]`;
        if (source && target) {
            if (!to) {
                if (Array.isArray(GATEWAYS_VARIANTS)) {
                    for (const variant of GATEWAYS_VARIANTS) {
                        changes.push({source: `${sourceVal}{${variant}}`, target: `${targetVal}{${variant}}`, reroute: to});
                    }
                } else {
                    changes.push({source: sourceVal, target: targetVal, reroute: to});
                }
            } else {
                const [reroute] = to.split(" -> ");
                const rerouteVal = `region[${reroute}:out]`;
                if (reroute) {
                    if (Array.isArray(GATEWAYS_VARIANTS)) {
                        for (const variant of GATEWAYS_VARIANTS) {
                            changes.push({source: `${sourceVal}{${variant}}`, target: `${targetVal}{${variant}}`, reroute: `${rerouteVal}{${variant}}`});
                        }
                    } else {
                        changes.push({source: sourceVal, target: targetVal, reroute: rerouteVal});
                    }
                }
            }
        }
    }

}
