import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const FilterResource = await JSONCResource.get("/database/filter.json");

export default FilterResource;
