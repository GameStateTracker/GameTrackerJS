// frameworks
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";

import AbstractSettingsWindow from "./AbstractSettingsWindow.js";
import SettingsResource from "../../../data/resource/SettingsResource.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";

// TODO bind erase stored data button

function applySettingsChoices(settings) {
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
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
            await BusyIndicatorManager.busy();
            const settings = event.data;
            SettingsStorage.setAll(settings);
            applySettingsChoices(settings);
            await BusyIndicatorManager.unbusy();
        });
    }

    show(category) {
        const values = SettingsStorage.getAll();
        super.show(values, category);
    }

    static getLabel(label) {
        return `setting[${label}]`;
    }

}

customElements.define("gt-window-appsettings", AppSettingsWindow);
