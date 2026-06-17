import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import SettingsResource from "../../data/resource/SettingsResource.js";

const options = SettingsResource.get();
const TrackerSettingsConfigHandler = new SettingsConfigHandler(options, {getLabel: (label) => `setting[${label}]`});
window.settings = TrackerSettingsConfigHandler;

export default TrackerSettingsConfigHandler;
