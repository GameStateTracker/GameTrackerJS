import ObservableMultiDefaultValueStorage from "@emcjs/core/data/storage/observable/ObservableMultiDefaultValueStorage.js";
import OptionGroupRegistry from "@emcjs/fe/registry/form/OptionGroupRegistry.js";
import BusyIndicatorManager from "@emcjs/fe/util/busy/BusyIndicatorManager.js";
import SettingsOverlay from "@emcjs/fe/ui/settings/SettingsOverlay.js";
import OptionsResource from "../../data/resource/OptionsResource.js";
import ItemsResource from "../../data/resource/ItemsResource.js";
import RulesetsResource from "../../data/resource/RulesetsResource.js";
import WorldResource from "../../data/resource/WorldResource.js";
import OptionsStorage from "../../savestate/storage/OptionsStorage.js";
import StartItemsStorage from "../../savestate/storage/StartItemsStorage.js";
import TPL from "./SavestateOptionsOverlay.js.html" assert {type: "html"};
import SavestateOptionsConfigHandler from "../../util/settings/SavestateOptionsConfigHandler.js";

const LOCATIONS = WorldResource.get("locations");
const LOCATION_NAMES = Object.keys(LOCATIONS).reduce((res, value) => {
    res[`excluded_location[${value}]`] = `location[${value}]`;
    return res;
}, {});
const locationsOptionGroup = new OptionGroupRegistry("Locations.names");
locationsOptionGroup.setAll(LOCATION_NAMES);

export default class SavestateOptionsOverlay extends SettingsOverlay {

    #itemStorage;

    #footerEl;

    #optionsPresetInputEl;

    #optionsPresetButtonEl;

    constructor() {
        super("Randomizer options");
        const els = TPL.generate();
        /* --- */
        this.#footerEl = this.shadowRoot.getElementById("footer");
        const presetWrapperEl = els.getElementById("options-preset-wrapper");
        this.#footerEl.prepend(presetWrapperEl);
        this.#optionsPresetInputEl = this.shadowRoot.getElementById("options-preset-input");
        this.#optionsPresetButtonEl = this.shadowRoot.getElementById("options-preset-button");
        /* --- */
        this.#itemStorage = new ObservableMultiDefaultValueStorage();
        for (const key of Object.keys(ItemsResource.get())) {
            this.#itemStorage.setDefault(key, 0);
        }
        /* --- */
        this.loadConfig(SavestateOptionsConfigHandler.config, SavestateOptionsConfigHandler.defaultValues.unresolved);
        /* --- */
        this.#loadPresetOptions();
        this.#optionsPresetButtonEl.addEventListener("click", () => {
            const preset = this.#optionsPresetInputEl.value;
            if (preset != null) {
                this.#loadRuleset(preset);
            }
        });
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicatorManager.busy();
            /* --- */
            const settings = SavestateOptionsConfigHandler.convertFromFormData(event.data);
            OptionsStorage.setAll(settings);
            /* --- */
            const items = this.#itemStorage.getAll();
            StartItemsStorage.setAll(items);
            /* --- */
            await BusyIndicatorManager.unbusy();
        });
        /* --- */
        this.#initValues();
        OptionsStorage.addEventListener("clear", () => {
            this.#initValues();
        });
        OptionsStorage.addEventListener("load", () => {
            this.#initValues();
        });
        OptionsStorage.addEventListener("change", (event) => {
            this.#loadValues(event.data);
        });
    }

    show() {
        super.show();
        this.#initValues();
    }

    async #initValues() {
        await BusyIndicatorManager.busy();
        const items = StartItemsStorage.getAll();
        this.#itemStorage.setAll(items);
        const values = OptionsStorage.getAll();
        const data = SavestateOptionsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data);
        await BusyIndicatorManager.unbusy();
    }

    async #loadValues(values) {
        const data = SavestateOptionsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data, true);
    }

    overwriteItems(data) {
        this.#itemStorage.deserialize(data);
    }

    #loadPresetOptions() {
        const allRulesets = Object.keys(RulesetsResource.get());
        for (const value of allRulesets) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.innerHTML = value;
            this.#optionsPresetInputEl.append(opt);
        }
    }

    #loadRuleset(name) {
        const ruleset = RulesetsResource.get(name);
        if (!ruleset) {
            return;
        }
        const items = {};
        const options = {};

        if (ruleset.items != null) {
            for (const key in ruleset.items) {
                const value = ruleset.items[key];
                items[key] = value;
            }
        }

        const optionsData = OptionsResource.get();
        for (const key in optionsData) {
            const oData = optionsData[key];
            if (oData.type == "list") {
                const list = ruleset.options?.[key];
                if (list != null) {
                    for (const name of oData.values) {
                        try {
                            options[name] = ruleset.options?.[name] ?? list.includes(name);
                        } catch {
                            console.error(`error loading preset value for "${name}"`);
                        }
                    }
                } else {
                    for (const name of oData.values) {
                        try {
                            options[name] = ruleset.options?.[name] ?? oData.default.includes(name);
                        } catch {
                            console.error(`error loading preset value for "${name}"`);
                        }
                    }
                }
            } else {
                try {
                    options[key] = ruleset.options?.[key] ?? oData.default;
                } catch {
                    console.error(`error loading preset value for "${key}"`);
                }
            }
        }

        const data = SavestateOptionsConfigHandler.convertToFormData(options);
        this.setValuesFlat(data);
        this.overwriteItems(items);
    }

}

customElements.define("tootr-overlay-savestate-options", SavestateOptionsOverlay);
