import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import OptionsResource from "../../data/resource/OptionsResource.js";

const options = OptionsResource.get();
const SavestateOptionsConfigHandler = new SettingsConfigHandler(options, {getLabel: (label) => `option[${label}]`});
window.options = SavestateOptionsConfigHandler;

export default SavestateOptionsConfigHandler;
