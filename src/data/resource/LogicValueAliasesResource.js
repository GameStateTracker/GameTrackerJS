import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const LogicValueAliasesResource = await JSONCResource.get("/database/logic_value_aliases.json");

export default LogicValueAliasesResource;
