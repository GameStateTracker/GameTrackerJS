import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const GridsResource = await JSONCResource.get("/database/grids.json");

export default GridsResource;
