import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import SettingsOverlay from "/emcJS/ui/settings/SettingsOverlay.js";
import SettingsResource from "../../data/resource/SettingsResource.js";
import SettingsConfigHandler from "../../util/settings/SettingsConfigHandler.js";
import SettingsStorage from "../../storage/SettingsStorage.js";
import Language from "../../util/Language.js";
import i18n from "/emcJS/util/I18n.js";

const options = SettingsResource.get();
const settingsConfigHandler = new SettingsConfigHandler(options, (label) => `setting[${label}]`);
window.settings = settingsConfigHandler;

const languageOptionGroup = new OptionGroupRegistry("I18n.languages");
setLanguageOptions();
i18n.addEventListener("languages", () => {
    setLanguageOptions();
});

function setLanguageOptions() {
    const languageOptions = {};
    const values = Language.getLanguages();
    for (const lang of values) {
        languageOptions[lang] = lang;
    }
    languageOptionGroup.setAll(languageOptions);
}

function applySettingsChoices(settings) {
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
}

applySettingsChoices(SettingsStorage.getAll());

export default class TrackerSettingsOverlay extends SettingsOverlay {

    constructor() {
        super("Tracker settings");
        /* --- */
        this.loadConfig(settingsConfigHandler.config, settingsConfigHandler.defaultValues);
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicatorManager.busy();
            /* --- */
            const settings = settingsConfigHandler.convertFromFormData(event.data);
            SettingsStorage.setAll(settings);
            /* --- */
            applySettingsChoices(settings);
            /* --- */
            await BusyIndicatorManager.unbusy();
        });
        /* --- */
        this.#initValues();
        SettingsStorage.addEventListener("clear", () => {
            this.#initValues();
        });
        SettingsStorage.addEventListener("load", () => {
            this.#initValues();
        });
        SettingsStorage.addEventListener("change", (event) => {
            this.#loadValues(event.data);
        });
    }

    async #initValues() {
        await BusyIndicatorManager.busy();
        const values = SettingsStorage.getAll();
        const data = settingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data);
        await BusyIndicatorManager.unbusy();
    };

    async #loadValues(values) {
        const data = settingsConfigHandler.convertToFormData(values);
        this.setValuesFlat(data, true);
    }

}

customElements.define("tootr-overlay-tracker-settings", TrackerSettingsOverlay);
