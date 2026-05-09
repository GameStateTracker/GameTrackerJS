import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const RulesetsResource = await JSONCResource.get("/database/rulesets.json");

export default RulesetsResource;
