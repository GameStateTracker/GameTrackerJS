import {
    getFromObjectByPath
} from "/emcJS/util/helper/collection/ObjectContent.js";
import DataState from "../state/DataState.js";

export default class SimpleStateManager {

    #propdata;

    #defaultState;

    #classes = new Map();

    #instances = new Map();

    constructor(DefaultState, props) {
        if (!(DefaultState.prototype instanceof DataState)) {
            throw new Error("DefaultState must be an instance of DataState");
        }
        /* --- */
        this.#defaultState = DefaultState;
        this.#propdata = props;
    }

    setDefaultState(DefaultState) {
        if (!(DefaultState.prototype instanceof DataState)) {
            throw new Error("DefaultState must be an instance of DataState");
        }
        this.#defaultState = DefaultState;
    }

    register(type, CustomState) {
        this.#classes.set(type, CustomState);
    }

    has(ref) {
        return this.#propdata[ref] != null;
    }

    get(ref) {
        if (ref == null || ref === "") {
            return;
        }
        if (this.#instances.has(ref)) {
            return this.#instances.get(ref);
        }
        const props = getFromObjectByPath(this.#propdata, ref.split("/"));
        if (props != null) {
            if (this.#classes.has(props.type)) {
                const CustomState = this.#classes.get(props.type);
                const inst = this.createState(CustomState, ref, props);
                this.#instances.set(ref, inst);
                return inst;
            } else {
                const inst = this.createState(this.#defaultState, ref, props);
                this.#instances.set(ref, inst);
                return inst;
            }
        } else {
            console.warn(`tried to get state for unknown entity "${ref}" from "${this.constructor.name}"`);
        }
    }

    createState(StateClass, ref, props) {
        return new StateClass(ref, props);
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#instances) {
            res[key] = value;
        }
        return res;
    }

    [Symbol.iterator]() {
        const keys = Object.keys(this.#propdata);
        let index = 0;
        return {
            next: () => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {value: [key, this.get(key)], done: false};
                } else {
                    return {done: true};
                }
            }
        }
    }

}
