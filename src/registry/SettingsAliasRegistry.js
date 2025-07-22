
const ALIAS_REGISTRY = new Map();

const SettingsAliasRegistry = {

    registerAlias(name, callback) {
        ALIAS_REGISTRY.set(name, callback);
    },

    resolveAlias(name) {
        return ALIAS_REGISTRY.get(name)?.();
    }

};

export default SettingsAliasRegistry;
