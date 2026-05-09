import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const ItemsResource = await JSONCResource.get("/database/items.json");

export default ItemsResource;
