import {debounce} from "@emcjs/core/util/Debouncer.js";

class SettingsValuesAliasRegistry extends EventTarget {

    #aliasRegistry = new Map();

    registerAlias(name, callback) {
        this.#aliasRegistry.set(name, callback);
        this.#handleChange();
    }

    resolveAlias(name) {
        return this.#aliasRegistry.get(name)?.();
    }

    #handleChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

}

const SettingsAliasRegistry = new SettingsValuesAliasRegistry();

export default SettingsAliasRegistry;
