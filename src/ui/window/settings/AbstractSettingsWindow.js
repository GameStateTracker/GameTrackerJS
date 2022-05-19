// frameworks
import SettingsWindow from "/emcJS/ui/overlay/window/settings/SettingsWindow.js";

import Language from "../../../util/Language.js";

const VARS = {"I18n.languages": Language.getLanguages};

function convertValueList(values = {}) {
    if (typeof values == "string") {
        values = VARS[values]();
    }
    const opt = {};
    if (typeof values == "object") {
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
    }
    return opt;
}

export default class AbstractSettingsWindow extends SettingsWindow {

    addChoiceInput(category, ref, label, desc, def, visible, resettable, values) {
        values = convertValueList(values);
        super.addChoiceInput(category, ref, label, desc, def, visible, resettable, values);
    }

    addListSelectInput(category, ref, label, desc, def, visible, resettable, multiple, values) {
        values = convertValueList(values);
        super.addListSelectInput(category, ref, label, desc, def, visible, resettable, multiple, values);
    }

}
