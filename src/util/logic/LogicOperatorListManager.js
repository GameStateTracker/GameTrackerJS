import LogicOperatorRegistry from "@emcjs/core/registry/LogicOperatorRegistry.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";

function getEntryType(entry) {
    switch (entry.type) {
        case "SimpleSelect":
        case "SearchSelect":
        case "ImageSelect":
        case "RelationSelect":
        case "SwitchSelect": {
            return "choice";
        }
        case "GridSelect":
        case "ListSelect":
        case "TokenSelect": {
            return entry.multiple ? "list" : "choice";
        }
    }
    return entry.type;
}

function getOptions(entry) {
    const options = entry.options ?? entry.values ?? {};
    if (typeof options !== "object") {
        return {};
    }
    if (!Array.isArray(options)) {
        return options;
    }
    return options.reduce((prev, current) => {
        prev[current] = current;
        return prev;
    }, {});
}

class LogicOperatorListManager {

    setValues(data, group, options = {}) {
        const {
            prefix = "", postfix = ""
        } = options;
        for (const name in data) {
            const key = `${prefix}${name}${postfix}`;
            this.#setValueOperator(key, group);
        }
    }

    setStates(data, group, options = {}) {
        const {
            prefix = "", postfix = ""
        } = options;
        for (const name in data) {
            const entry = data[name];
            const options = getOptions(entry);
            const value = entry.value ?? entry.default ?? Object.keys(options)[0];
            const key = `${prefix}${name}${postfix}`;
            this.#setStateOperator(key, options, value, group);
        }
    }

    set(data, group, options = {}) {
        const {
            prefix = "", postfix = ""
        } = options;
        for (const name in data) {
            const entry = data[name];
            const entryType = getEntryType(entry);
            switch (entryType) {
                case "choice": {
                    const options = getOptions(entry);
                    const value = entry.value ?? entry.default ?? Object.keys(options)[0];
                    const key = `${prefix}${name}${postfix}`;
                    this.#setStateOperator(key, options, value, group);
                } break;
                case "list": {
                    const options = getOptions(entry);
                    for (const value of Object.keys(options)) {
                        const key = `${prefix}${value}${postfix}`;
                        this.#setValueOperator(key, group);
                    }
                }
                default: {
                    const key = `${prefix}${name}${postfix}`;
                    this.#setValueOperator(key, group);
                } break;
            }
        }
    }

    #setValueOperator(key, group) {
        LogicOperatorRegistry.setAndLinkOperator(key, {type: "value"}, group);
    }

    #setStateOperator(key, options, value, group) {
        options = deepClone(options);
        LogicOperatorRegistry.setAndLinkOperator(key, {
            type: "state",
            options,
            value
        }, group);
    }

}

export default new LogicOperatorListManager();
