// frameworks
import ObservableDefaultingStorage from "/emcJS/data/storage/observable/ObservableDefaultingStorage.js";
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";

import AbstractSettingsWindow from "./AbstractSettingsWindow.js";
import OptionsResource from "../../../data/resource/OptionsResource.js";
import ItemsResource from "../../../data/resource/ItemsResource.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import StartItemsStorage from "../../../savestate/storage/StartItemsStorage.js";

const ITEM_STORAGE = new WeakMap();

export default class SavestateOptionsWindow extends AbstractSettingsWindow {

    constructor() {
        super("Randomizer options") ;
        /* --- */
        const options = OptionsResource.get();
        SettingsBuilder.build(this, options);
        const itemStorage = new ObservableDefaultingStorage();
        ITEM_STORAGE.set(this, itemStorage);
        /* --- */
        for (const key of Object.keys(ItemsResource.get())) {
            itemStorage.setDefault(key, 0);
        }
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicator.busy();
            /* --- */
            const settings = event.data;
            OptionsStorage.setAll(settings);
            /* --- */
            const items = itemStorage.getAll();
            StartItemsStorage.setAll(items);
            /* --- */
            await BusyIndicator.unbusy();
        });
    }

    show() {
        const items = StartItemsStorage.getAll();
        const storage = ITEM_STORAGE.get(this);
        storage.setAll(items);
        /* -- */
        const values = OptionsStorage.getAll();
        super.show(values);
    }

    overwriteItems(data) {
        const storage = ITEM_STORAGE.get(this);
        storage.deserialize(data);
    }

    static getLabel(label) {
        return `option[${label}]`;
    }

}

customElements.define("gt-window-savestateoptions", SavestateOptionsWindow);
