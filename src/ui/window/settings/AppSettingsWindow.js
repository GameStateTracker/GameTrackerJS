// frameworks
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";

import AbstractSettingsWindow from "./AbstractSettingsWindow.js";
import SettingsResource from "../../../resource/SettingsResource.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import AutosaveHandler from "../../../savestate/AutosaveHandler.js";

// TODO bind erase stored data button

function applySettingsChoices(settings) {
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    AutosaveHandler.time = settings.autosave_time;
    AutosaveHandler.slots = settings.autosave_amount;
}

applySettingsChoices(SettingsStorage.getAll());

export default class AppSettingsWindow extends AbstractSettingsWindow {

    constructor() {
        super("App settings") ;
        /* --- */
        const options = SettingsResource.get();
        SettingsBuilder.build(this, options);
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicator.busy();
            const settings = event.data;
            SettingsStorage.setAll(settings);
            applySettingsChoices(settings);
            await BusyIndicator.unbusy();
        });
    }

    show(category) {
        const values = SettingsStorage.getAll();
        super.show(values, category);
    }

}

customElements.define("gt-window-appsettings", AppSettingsWindow);
