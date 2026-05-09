import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const OptionsResource = await JSONCResource.get("/database/options.json");

export default OptionsResource;
