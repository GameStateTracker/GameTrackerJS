// frameworks
import ObservableMultiDefaultValueStorage from "/emcJS/data/storage/observable/ObservableMultiDefaultValueStorage.js";
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";

import AbstractSettingsWindow from "./AbstractSettingsWindow.js";
import OptionsResource from "../../../data/resource/OptionsResource.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import StartItemsStorage from "../../../savestate/storage/StartItemsStorage.js";

export default class SavestateOptionsWindow extends AbstractSettingsWindow {

    #itemStorage;

    constructor() {
        super("Randomizer options") ;
        /* --- */
        const options = OptionsResource.get();
        SettingsBuilder.build(this, options);
        this.#itemStorage = new ObservableMultiDefaultValueStorage();
        /* --- */
        for (const key of Object.keys(ItemsResource.get())) {
            this.#itemStorage.setDefault(key, 0);
        }
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicatorManager.busy();
            /* --- */
            const settings = event.data;
            OptionsStorage.setAll(settings);
            /* --- */
            const items = this.#itemStorage.getAll();
            StartItemsStorage.setAll(items);
            /* --- */
            await BusyIndicatorManager.unbusy();
        });
    }

    show() {
        const items = StartItemsStorage.getAll();
        this.#itemStorage.setAll(items);
        /* -- */
        const values = OptionsStorage.getAll();
        super.show(values);
    }

    overwriteItems(data) {
        this.#itemStorage.deserialize(data);
    }

    static getLabel(label) {
        return `option[${label}]`;
    }

}

customElements.define("gt-window-savestateoptions", SavestateOptionsWindow);
