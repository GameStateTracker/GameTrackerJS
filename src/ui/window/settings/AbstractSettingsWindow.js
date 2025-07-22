// frameworks
import SettingsWindow from "/emcJS/ui/overlay/window/settings/SettingsWindow.js";

import Language from "../../../util/Language.js";
import WorldResource from "../../../data/resource/WorldResource.js";
import SettingsAliasRegistry from "../../../registry/SettingsAliasRegistry.js";

const LOCATIONS = WorldResource.get("locations");
const LOCATION_NAMES = Object.keys(LOCATIONS).reduce((res, value) => {
    res[`excluded_location[${value}]`] = `location[${value}]`;
    return res;
}, {});

SettingsAliasRegistry.registerAlias("I18n.languages", Language.getLanguages);
SettingsAliasRegistry.registerAlias("Locations.names", () => LOCATION_NAMES);

function convertValueList(values = {}) {
    if (typeof values !== "object") {
        values = SettingsAliasRegistry.resolveAlias(values);
    }
    if (values == null) {
        return {};
    }
    const opt = {};
    if (Array.isArray(values)) {
        for (const key of values) {
            opt[key] = key;
        }
    } else {
        for (const key in values) {
            if (values[key] != null) {
                opt[key] = values[key];
            } else {
                opt[key] = key;
            }
        }
    }
    return opt;
}

function convertDefaultList(values = {}) {
    if (typeof values !== "object") {
        values = SettingsAliasRegistry.resolveAlias(values);
    }
    if (values == null) {
        return [];
    }
    if (Array.isArray(values)) {
        return [...values];
    }
    return Object.keys(values);
}

export default class AbstractSettingsWindow extends SettingsWindow {

    addChoiceInput(category, ref, label, desc, def, visible, resettable, values) {
        values = convertValueList(values);
        super.addChoiceInput(category, ref, label, desc, def, visible, resettable, values);
    }

    addListSelectInput(category, ref, label, desc, def, visible, resettable, multiple, values) {
        values = convertValueList(values);
        def = convertDefaultList(def);
        super.addListSelectInput(category, ref, label, desc, def, visible, resettable, multiple, values);
    }

}
