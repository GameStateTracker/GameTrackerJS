// frameworks
import I18n from "/emcJS/util/I18n.js";
import I18nLabel from "/emcJS/ui/i18n/I18nLabel.js";
import I18nTooltip from "/emcJS/ui/i18n/I18nTooltip.js";

import SettingsObserver from "./observer/SettingsObserver.js";

const languageObserver = new SettingsObserver("language");

class Language {

    constructor() {
        languageObserver.addEventListener("change", (event) => {
            I18n.language = event.value;
        });
    }

    async load(code) {
        await I18n.loadTranslations();
        I18n.language = code;
    }

    getLanguages() {
        return I18n.getLanguages();
    }

    translate(index) {
        if (!index) {
            return "";
        }
        return I18n.get(index);
    }

    generateLabel(key) {
        const el = document.createElement("emc-i18n-label");
        el.i18nValue = key;
        return el;
    }

    generateTooltip(key) {
        const el = document.createElement("emc-i18n-tooltip");
        el.i18nTooltip = key;
        return el;
    }

    applyLabel(el, key) {
        if (el.children[0] instanceof I18nLabel) {
            const label = el.children[0];
            label.i18nValue = key;
            return el;
        } else {
            const label = this.generateLabel(key);
            el.innerHTML = "";
            el.append(label);
            return el;
        }
    }

    applyTooltip(el, key) {
        if (el.parentElement instanceof I18nTooltip) {
            const tooltip = el.parentElement;
            tooltip.i18nValue = key;
            return tooltip;
        } else {
            const tooltip = this.generateTooltip(key);
            tooltip.append(el);
            return tooltip;
        }
    }

}

export function i18n(strings, ...values) {
    const key = [strings.raw[0]];
    for (const k in values) {
        const v = values[k];
        key.push(v, strings.raw[k + 1])
    }
    return I18n.get(key.join(""));
}

export default new Language();
